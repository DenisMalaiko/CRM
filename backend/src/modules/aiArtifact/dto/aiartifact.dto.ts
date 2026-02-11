import {IsEnum, IsOptional, IsUUID} from "class-validator";
import {AIArtifactStatus, AIArtifactType} from "@prisma/client";

export class AiArtifactBaseDto {
  @IsOptional()
  outputJson: any;

  @IsEnum(AIArtifactStatus)
  status: AIArtifactStatus
}

export class CreateAiArtifactDto extends AiArtifactBaseDto {}

export class UpdateAiArtifactDto extends AiArtifactBaseDto {}

export class AiArtifactIdParamDto {
  @IsUUID()
  id: string;
}