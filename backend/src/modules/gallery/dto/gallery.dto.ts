import {IsBoolean, IsEnum, IsOptional, IsUUID} from "class-validator";
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