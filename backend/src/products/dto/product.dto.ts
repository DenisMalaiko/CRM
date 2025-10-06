import { IsUUID, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  sku: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  @IsString()
  category: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsDate()
  @IsOptional()
  updatedAt?: string;
}