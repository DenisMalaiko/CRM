import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class TrendIdParamDto {
  @IsUUID()
  businessId: string;
}

export class ProfileIdParamDto {
  @IsUUID()
  profileId: string;
}

export class CreateTrendDto {
  @IsUUID()
  businessId: string;

  @IsUUID()
  platformId: string;

  @IsString()
  source: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  format: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @IsDateString()
  publishedAt: string;

  @IsObject()
  metrics: Record<string, unknown>;
}

export class UpdateTrendDto extends PartialType(CreateTrendDto) {}

export class TrendFilterDto {
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @IsUUID()
  @IsOptional()
  platformId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
