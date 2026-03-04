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
  description?: string | null;
  createdAt: Date;
}

export type TGalleryPhotoUpdate = {
  type: GalleryPhotoType;
  isActive: boolean;
  description?: string | null;
}