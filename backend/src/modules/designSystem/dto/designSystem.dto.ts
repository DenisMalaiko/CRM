import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import {
  TColorToken,
  TGradient,
  TTypography,
  TBorder,
  TShadow,
  TSpacing,
  TBrandElements,
  TComposition,
  TScene,
} from '../entities/designSystem.entity';

export class DesignSystemIdParamDto {
  @IsUUID()
  id: string;
}

export class BusinessIdParamDto {
  @IsUUID()
  businessId: string;
}

export class CreateDesignSystemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsObject()
  colors?: TColorToken;

  @IsOptional()
  @IsArray()
  gradients?: TGradient[];

  @IsOptional()
  @IsObject()
  typography?: TTypography;

  @IsOptional()
  @IsString()
  radius?: string;

  @IsOptional()
  @IsObject()
  border?: TBorder;

  @IsOptional()
  @IsObject()
  shadow?: TShadow;

  @IsOptional()
  @IsObject()
  spacing?: TSpacing;

  @IsOptional()
  @IsObject()
  brandElements?: TBrandElements;

  @IsOptional()
  @IsObject()
  composition?: TComposition;

  @IsOptional()
  @IsObject()
  scene?: TScene;
}

export class CreateDesignSystemFromPhotoDto {
  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateDesignSystemDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  colors?: TColorToken;

  @IsOptional()
  @IsArray()
  gradients?: TGradient[];

  @IsOptional()
  @IsObject()
  typography?: TTypography;

  @IsOptional()
  @IsString()
  radius?: string;

  @IsOptional()
  @IsObject()
  border?: TBorder;

  @IsOptional()
  @IsObject()
  shadow?: TShadow;

  @IsOptional()
  @IsObject()
  spacing?: TSpacing;

  @IsOptional()
  @IsObject()
  brandElements?: TBrandElements;

  @IsOptional()
  @IsObject()
  composition?: TComposition;

  @IsOptional()
  @IsObject()
  scene?: TScene;
}
