export type TGalleryPhotoBase = {
  businessId: string;
  type: string;
  isActive: boolean;
}

export type TGalleryPhoto = TGalleryPhotoBase & {
  id: string;
  url: string;
  createdAt: Date;
}

export type TGalleryFormUpload = TGalleryPhotoBase;

export type TGalleryPhotoPreview = {
  file: File;
  preview: string;
};