import {
  IsArray,
  IsEnum,
  IsIn,
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

  @IsString()
  @IsOptional()
  holidayName?: string;

  @IsString()
  @IsOptional()
  holidayDate?: string;
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

export class UpdateContentPlanPostDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  date?: string;

  @IsIn(['TOFU', 'MOFU', 'BOFU'])
  @IsOptional()
  funnelStage?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  format?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contentType?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  topic?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  marketingGoal?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  hook?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  thesis?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cta?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  designReference?: string;
}
