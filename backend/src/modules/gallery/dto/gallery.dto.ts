import {IsBoolean, IsEnum, IsOptional, IsUUID, IsString} from "class-validator";
import { GalleryPhotoType } from "@prisma/client";

export class GalleryPhotoBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsBoolean()
  isActive: boolean;

  @IsEnum(GalleryPhotoType)
  type: GalleryPhotoType;
}

export class GalleryPhotoIdParamDto {
  @IsUUID()
  id: string;
}

export class UpdateGalleryPhotoDto {
  @IsEnum(GalleryPhotoType)
  type: GalleryPhotoType;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}



// Default Gallery Photo
export class DefaultGalleryPhotoBaseDto {
  @IsEnum(GalleryPhotoType)
  type: GalleryPhotoType;
}

export class DefaultUpdateGalleryPhotoDto {
  @IsEnum(GalleryPhotoType)
  type: GalleryPhotoType;

  @IsOptional()
  @IsString()
  description?: string;
}