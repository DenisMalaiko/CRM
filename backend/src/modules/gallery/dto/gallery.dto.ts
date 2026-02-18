import {IsBoolean, IsEnum, IsOptional, IsString, IsUUID} from "class-validator";

export class GalleryPhotoBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsBoolean()
  isActive: boolean;

  @IsEnum(["Image", "Post"])
  type: 'Image' | 'Post';
}

export class GalleryPhotoIdParamDto {
  @IsUUID()
  id: string;
}