import {IsBoolean, IsOptional, IsString, IsUUID} from "class-validator";

export class PromptBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  name: string;

  @IsString()
  text: string;

  @IsString()
  purpose: string;

  @IsBoolean()
  isActive: boolean;
}

export class CreatePromptDto extends PromptBaseDto {}

export class UpdatePromptDto extends PromptBaseDto {}

export class PromptIdParamDto {
  @IsUUID()
  id: string;
}