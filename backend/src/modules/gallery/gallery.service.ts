import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { S3Service } from "../../core/s3/s3.service";
import { UploadedImage } from "./entities/gallery.entity";
import { StorageUrlService } from "../../core/storage/storage-url.service";


@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly storageUrlService: StorageUrlService
  ) {}

  async getPhotos(businessId: string): Promise<any> {
    const galleryPhotos = await this.prisma.galleryPhoto.findMany({
      where: { businessId: businessId },
    });

    return galleryPhotos.map((photo) => {
      return {
        ...photo,
        imageUrl: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : null,
      }
    })
  }

  async uploadPhotos(
    dto: {
      businessId: string;
      type: string;
      isActive: boolean;
    },
    files: Express.Multer.File[],
  ) {
    console.log("SERVICE")
    console.log("DTO ", dto);
    console.log("FILES ", files);

    if (!files.length) return [];

    // 1️⃣ Upload to S3
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

      // 2️⃣ Save to DB
      const records = await this.prisma.galleryPhoto.createMany({
        data: uploaded.map((img) => ({
          businessId: dto.businessId,
          type: dto.type,
          isActive: dto.isActive,
          url: img.key,
        })),
      });

      return records;
    } catch (error) {
      await Promise.all(
        uploaded.map((img) =>
          this.s3Service.delete(img.key),
        ),
      );

      throw error;
    }
  }
}