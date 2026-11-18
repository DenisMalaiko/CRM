import { GalleryType } from "../enum/GalleryType";

export type TPhotoDescription = Record<string, string>;

export type TGalleryPhotoBase = {
  businessId: string;
  type: GalleryType;
  isActive: boolean;
}

export type TGalleryPhoto = TGalleryPhotoBase & {
  id: string;
  url: string;
  description: TPhotoDescription;
  createdAt: Date;
  isDefault?: boolean;
}

export type TGalleryPhotoPreview = {
  file: File;
  preview: string;
};


// Update Photo
export type TGalleryPhotoUpdateForm = {
  isActive: boolean;
  type: GalleryType;
  description: TPhotoDescription;
}

export type TGalleryPhotoUpdate = TGalleryPhotoUpdateForm & {
  id: string;
};



// Default Gallery Photo
export type TDefaultGalleryPhotoBase = {
  type: GalleryType;
  isActive: boolean;
}

export type TDefaultGalleryPhoto = TDefaultGalleryPhotoBase & {
  id: string;
  url: string;
  description: TPhotoDescription;
  createdAt: Date;
}

export type TDefaultGalleryPhotoPreview = {
  file: File;
  preview: string;
};

export type TDefaultGalleryPhotoUpdateForm = {
  isActive: boolean;
  type: GalleryType;
  description: TPhotoDescription;
}

export type TDefaultGalleryPhotoUpdate = TDefaultGalleryPhotoUpdateForm & {
  id: string;
};

// AI Gallery Photo
export type TAIGalleryPhoto = TGalleryPhotoBase & {
  prompt: string;
}

export type TAIGalleryPhotoCreate = TGalleryPhotoBase & {
  prompt: string;
  photosIds: string[];
  defaultPhotosIds: string[];
  aspectRatio: string;
}