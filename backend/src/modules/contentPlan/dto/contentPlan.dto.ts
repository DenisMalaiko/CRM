import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ContentPlanMode, ContentPlanStatus } from '@prisma/client';

export class GenerateContentPlanDto {
  @IsEnum(ContentPlanMode)
  @IsNotEmpty()
  mode: ContentPlanMode;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  productsIds?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  audiencesIds?: string[];

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true })
  ideasIds?: string[];

  @IsString()
  @IsOptional()
  context?: string;
}

export class UpdateContentPlanDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsEnum(ContentPlanStatus)
  @IsOptional()
  status?: ContentPlanStatus;
}
