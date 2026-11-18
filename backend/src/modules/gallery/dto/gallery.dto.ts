import {IsBoolean, IsEnum, IsOptional, IsUUID, IsString, IsArray, IsObject} from "class-validator";
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
  @IsObject()
  description?: Record<string, string>;
}



// Default Gallery Photo
export class DefaultGalleryPhotoBaseDto {
  @IsBoolean()
  isActive: boolean;

  @IsEnum(GalleryPhotoType)
  type: GalleryPhotoType;
}

export class DefaultUpdateGalleryPhotoDto {
  @IsEnum(GalleryPhotoType)
  type: GalleryPhotoType;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsObject()
  description?: Record<string, string>;
}

export class AiGeneratedGalleryPhotoDto extends GalleryPhotoBaseDto {
  @IsString()
  prompt: string;

  @IsArray()
  photosIds: string[];

  @IsArray()
  defaultPhotosIds: string[];

  @IsOptional()
  @IsString()
  aspectRatio?: string;
}