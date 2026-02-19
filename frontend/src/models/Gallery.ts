import { GalleryType } from "../enum/GalleryType";

export type TGalleryPhotoBase = {
  businessId: string;
  type: GalleryType;
  isActive: boolean;
}

export type TGalleryPhoto = TGalleryPhotoBase & {
  id: string;
  url: string;
  createdAt: Date;
}

export type TGalleryPhotoPreview = {
  file: File;
  preview: string;
};