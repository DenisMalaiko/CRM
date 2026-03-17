import {IsArray, IsEnum, IsOptional, IsUUID} from "class-validator";
import {AIArtifactStatus, AIArtifactType} from "@prisma/client";

export class AiArtifactBaseDto {
  @IsOptional()
  outputJson: any;

  @IsEnum(AIArtifactStatus)
  status: AIArtifactStatus
}

export class CreateAiArtifactDto {
  @IsEnum(AIArtifactType)
  type: AIArtifactType;

  @IsArray()
  @IsOptional()
  productsIds: string[];

  @IsArray()
  @IsOptional()
  audiencesIds: string[];

  @IsArray()
  @IsOptional()
  ideasIds: string[];

  @IsArray()
  @IsOptional()
  promptsIds: string[];

  @IsArray()
  @IsOptional()
  photosIds: string[];

  @IsArray()
  @IsOptional()
  defaultPhotosIds: string[];
}

export class UpdateAiArtifactDto extends AiArtifactBaseDto {}

export class AiArtifactIdParamDto {
  @IsUUID()
  id: string;
}