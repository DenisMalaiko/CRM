import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { GalleryPhotoType } from "@prisma/client";
import { PrismaService } from "../../core/prisma/prisma.service";
import { S3Service } from "../../core/s3/s3.service";
import {
  UploadedImage,
  TGalleryPhoto,
  TGalleryPhotoBase,
  TGalleryPhotoUpdate,

  TDefaultGalleryPhotoBase,
  TDefaultGalleryPhoto,
  TDefaultGalleryPhotoUpdate
} from "./entities/gallery.entity";
import { StorageUrlService } from "../../core/storage/storage-url.service";


@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly storageUrlService: StorageUrlService
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

  async uploadPhotos(dto: TGalleryPhotoBase, files: Express.Multer.File[]): Promise<{ count: number } | []> {
    if (!files.length) return [];

    const uploaded: UploadedImage[] = [];

    try {
      for (const file of files) {
        const key = `gallery/${dto.businessId}/${crypto.randomUUID()}.${file.mimetype.split('/')[1]}`;

        await this.s3Service.upload(
          key,
          file.buffer,
          file.mimetype,
        );

        uploaded.push({ key });
      }

      return await this.prisma.galleryPhoto.createMany({
        data: uploaded.map((img) => ({
          businessId: dto.businessId,
          type: dto.type,
          isActive: dto.isActive,
          url: img.key,
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
      select: { id: true, url: true },
    });

    if (!photo) {
      throw new Error('Gallery photo not found');
    }

    if (photo.url) {
      await this.s3Service.delete(photo.url);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.galleryPhoto.delete({
        where: { id },
      });
    });
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
}