import { IsUUID, IsString, IsNumber, IsOptional, IsDate, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTypeUI } from '../../enums/ProductType';
import { PriceSegmentUI } from '../../enums/PriceSegment';

export class ProductDto {
  @IsUUID()
  @IsOptional()
  id?: string;

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
  images: string[];
}