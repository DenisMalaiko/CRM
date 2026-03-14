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



// Default Gallery Photo
export type TDefaultGalleryPhotoBase = {
  type: GalleryType;
}

export type TDefaultGalleryPhoto = TDefaultGalleryPhotoBase & {
  id: string;
  url: string;
  description: string;
}

export type TDefaultGalleryPhotoPreview = {
  file: File;
  preview: string;
};

export type TDefaultGalleryPhotoUpdateForm = {
  type: GalleryType;
  description: string;
}

export type TDefaultGalleryPhotoUpdate = TDefaultGalleryPhotoUpdateForm & {
  id: string;
};