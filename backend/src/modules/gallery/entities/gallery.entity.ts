import { GalleryPhotoType } from "@prisma/client";

export type UploadedImage = {
  key: string;
  url?: string;
};

export type TGalleryPhotoBase = {
  businessId: string;
  type: GalleryPhotoType;
  isActive: boolean;
}

export type TGalleryPhoto = TGalleryPhotoBase & {
  id: string;
  url: string;
  createdAt: Date;
}