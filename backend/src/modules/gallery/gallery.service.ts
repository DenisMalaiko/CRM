import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { GalleryPhotoType, GalleryPhotoChangeType } from "@prisma/client";
import { PrismaService } from "../../core/prisma/prisma.service";
import { S3Service } from "../../core/s3/s3.service";
import { AiService } from "../ai/ai.service";
import {
  UploadedImage,
  TGalleryPhoto,
  TGalleryPhotoBase,
  TGalleryPhotoUpdate,

  TDefaultGalleryPhotoBase,
  TDefaultGalleryPhoto,
  TDefaultGalleryPhotoUpdate,
  TAIGalleryPhotoCreate,
} from './entities/gallery.entity';
import { StorageUrlService } from "../../core/storage/storage-url.service";


@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly storageUrlService: StorageUrlService,
    private readonly aiService: AiService,
  ) {}

  async getPhotos(businessId: string): Promise<TGalleryPhoto[]> {
    const galleryPhotos = await this.prisma.galleryPhoto.findMany({
      where: { businessId: businessId },
    });

    return galleryPhotos.map((photo) => {
      return {
        ...photo,
        url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
      }
    })
  }

  async getPhotosByType(businessId: string, type: GalleryPhotoType): Promise<string[]> {
    const galleryPhotos = await this.prisma.galleryPhoto.findMany({
      where: { businessId: businessId, type: type },
    });

    return galleryPhotos.map((photo) => {
      return photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "";
    })
  }

  async uploadPhotos(dto: TGalleryPhotoBase, files: Express.Multer.File[]): Promise<TGalleryPhoto[]> {
    if (!files.length) return [];

    const uploaded: UploadedImage[] = [];

    try {
      for (const file of files) {
        const key = `gallery/${dto.businessId}/${crypto.randomUUID()}.${file.mimetype.split('/')[1]}`;
        await this.s3Service.upload(key, file.buffer, file.mimetype);
        uploaded.push({ key });
      }

      const photos = await this.prisma.$transaction(async (tx) => {
        const created: TGalleryPhoto[] = [];

        for (const img of uploaded) {
          const photo = await tx.galleryPhoto.create({
            data: {
              businessId: dto.businessId,
              type: dto.type,
              isActive: dto.isActive,
              url: img.key,
              description: '',
            },
          });

          await tx.galleryPhotoHistory.create({
            data: {
              photoId: photo.id,
              businessId: photo.businessId,
              type: photo.type,
              isActive: photo.isActive,
              url: photo.url,
              description: photo.description,
              changeType: GalleryPhotoChangeType.Create,
            },
          });

          created.push(photo);
        }

        return created;
      });

      return photos;
    } catch (error) {
      await Promise.all(
        uploaded.map((img) => this.s3Service.delete(img.key))
      );
      throw error;
    }
  }

  async updatePhoto(id: string, body: TGalleryPhotoUpdate): Promise<TGalleryPhoto>  {
    if (!id) throw new NotFoundException('Artifact ID is required');

    try {
      return await this.prisma.galleryPhoto.update({
        where: {id},
        data: {
          type: body.type,
          isActive: body.isActive,
          description: body.description,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Artifact with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update artifact');
    }
  }

  async deletePhoto(id: string) {
    const photo = await this.prisma.galleryPhoto.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
        type: true,
        isActive: true,
        url: true,
        description: true,
      },
    });

    if (!photo) {
      throw new NotFoundException(`Gallery photo with id ${id} not found`);
    }

    const historyPhotos = await this.prisma.galleryPhotoHistory.findMany({
      where: { photoId: id },
      select: { url: true },
    });

    const urlsToDelete = Array.from(
      new Set(
        [photo.url, ...historyPhotos.map((h) => h.url)].filter(Boolean),
      ),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.galleryPhoto.delete({
        where: { id },
      });

      await tx.galleryPhotoHistory.deleteMany({
        where: { photoId: id },
      });
    });

    await Promise.allSettled(
      urlsToDelete.map((url) => this.s3Service.delete(url)),
    );

    return { success: true };
  }

  async regeneratePhoto(id: string, body: { prompt: string }) {
    const photo: any = await this.prisma.galleryPhoto.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        type: true,
        description: true,
        businessId: true
      }
    });

    if (!photo) {
      throw new NotFoundException(`Gallery photo with id ${id} not found`);
    }

    const businessId = photo.businessId;

    const galleryPhotosUrls = [photo].map((photo) => ({
      type: photo.type,
      url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
      description: photo.description ?? null,
    }));

    const generatedPhoto = await this.aiService.generateAiPhoto(
      businessId,
      body.prompt,
      galleryPhotosUrls
    );

    const updatedPhoto = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.galleryPhoto.update({
        where: { id },
        data: {
          url: generatedPhoto,
        },
      });

      await tx.galleryPhotoHistory.create({
        data: {
          photoId: updated.id,
          businessId: updated.businessId,
          type: updated.type,
          isActive: updated.isActive,
          url: updated.url,
          description: updated.description,
          changeType: GalleryPhotoChangeType.Update,
        },
      });

      return updated;
    });

    return updatedPhoto;
  }



  // Default Gallery Photos
  async getDefaultPhotos(): Promise<TDefaultGalleryPhoto[]> {
    const defaultPhotos = await this.prisma.defaultPhoto.findMany();

    return defaultPhotos.map((photo) => {
      return {
        ...photo,
        url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
      }
    })
  }

  async uploadDefaultPhotos(dto: TDefaultGalleryPhotoBase, files: Express.Multer.File[]): Promise<{ count: number } | []> {
    if (!files.length) return [];

    const uploaded: UploadedImage[] = [];

    try {
      for (const file of files) {
        const key = `gallery/templates/${crypto.randomUUID()}.${file.mimetype.split('/')[1]}`;

        await this.s3Service.upload(
          key,
          file.buffer,
          file.mimetype,
        );

        uploaded.push({ key });
      }

      return await this.prisma.defaultPhoto.createMany({
        data: uploaded.map((img) => ({
          type: dto.type,
          url: img.key,
          isActive: dto.isActive,
          description: "",
        })),
      });
    } catch (error) {
      await Promise.all(
        uploaded.map((img) =>
          this.s3Service.delete(img.key),
        ),
      );

      throw error;
    }
  }

  async updateDefaultPhoto(id: string, body: TDefaultGalleryPhotoUpdate): Promise<TDefaultGalleryPhoto>  {
    if (!id) throw new NotFoundException('Default photo ID is required');

    try {
      return await this.prisma.defaultPhoto.update({
        where: {id},
        data: {
          type: body.type,
          isActive: body.isActive,
          description: body.description,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Default photo with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update Default photo');
    }
  }

  async deleteDefaultPhoto(id: string) {
    const photo = await this.prisma.defaultPhoto.findUnique({
      where: { id },
      select: { id: true, url: true },
    });

    if (!photo) {
      throw new Error('Default gallery photo not found');
    }

    if (photo.url) {
      await this.s3Service.delete(photo.url);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.defaultPhoto.delete({
        where: { id },
      });
    });
  }


  // AI Gallery Photos
  async getAiPhotos(businessId): Promise<TGalleryPhoto[]> {
    const aiPhotos = await this.prisma.galleryPhoto.findMany({
      where: { businessId: businessId, type: GalleryPhotoType.AI },
    });

    return aiPhotos.map((photo) => {
      return {
        ...photo,
        url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
      }
    })
  }

  async generateAiPhoto(id: string, body: TAIGalleryPhotoCreate) {

    const [photos, defaultPhotos] = await Promise.all([
      this.prisma.galleryPhoto.findMany({
        where: { businessId: id, id: { in: body.photosIds } },
        select: { type: true, url: true, description: true }, // вибираємо тільки потрібні поля
      }),
      this.prisma.defaultPhoto.findMany({
        where: { id: { in: body.defaultPhotosIds } },
        select: { type: true, url: true, description: true },
      }),
    ]);

    const galleryPhotosUrls = [...photos, ...defaultPhotos].map((photo) => ({
      type: photo.type,
      url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
      description: photo.description ?? null,
    }));

    const generatedPhoto = await this.aiService.generateAiPhoto(id, body.prompt, galleryPhotosUrls);

    return this.prisma.$transaction(async (tx) => {
      const photo = await tx.galleryPhoto.create({
        data: {
          businessId: id,
          type: body.type,
          isActive: body.isActive,
          url: generatedPhoto,
          description: '',
        },
      });

      await tx.galleryPhotoHistory.create({
        data: {
          photoId: photo.id,
          businessId: photo.businessId,
          type: photo.type,
          isActive: photo.isActive,
          url: photo.url,
          description: photo.description,
          changeType: GalleryPhotoChangeType.Create,
        },
      });

      return photo;
    });
  }
}