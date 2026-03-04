import { GalleryType } from "../enum/GalleryType";

export type TGalleryPhotoBase = {
  businessId: string;
  type: GalleryType;
  isActive: boolean;
}

export type TGalleryPhoto = TGalleryPhotoBase & {
  id: string;
  url: string;
  description: string;
  createdAt: Date;
}

export type TGalleryPhotoPreview = {
  file: File;
  preview: string;
};


// Update Photo
export type TGalleryPhotoUpdateForm = {
  isActive: boolean;
  type: GalleryType;
  description: string;
}

export type TGalleryPhotoUpdate = TGalleryPhotoUpdateForm & {
  id: string;
};