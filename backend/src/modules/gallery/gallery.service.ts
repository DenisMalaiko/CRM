import { Injectable } from '@nestjs/common';
import { GalleryPhotoType } from "@prisma/client";
import { PrismaService } from "../../core/prisma/prisma.service";
import { S3Service } from "../../core/s3/s3.service";
import { UploadedImage, TGalleryPhoto, TGalleryPhotoBase } from "./entities/gallery.entity";
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
      console.log("--------")
      console.log("DTO ", dto)
      console.log("--------")

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
}