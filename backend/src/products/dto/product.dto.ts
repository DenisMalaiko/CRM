import { IsUUID, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  agencyId: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  sku: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsString()
  category: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}