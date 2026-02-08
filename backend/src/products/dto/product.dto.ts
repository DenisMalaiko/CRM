import { IsUUID, IsString, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ProductTypeUI } from '../../enums/ProductType';
import { PriceSegmentUI } from '../../enums/PriceSegment';

export class ProductBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsEnum(ProductTypeUI)
  type: ProductTypeUI;

  @IsEnum(PriceSegmentUI)
  priceSegment: PriceSegmentUI;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @IsOptional()
  images: string[];
}

export class CreateProductDto  extends ProductBaseDto {}

export class UpdateProductDto  extends ProductBaseDto {}

export class ProductIdParamDto {
  @IsUUID()
  id: string;
}