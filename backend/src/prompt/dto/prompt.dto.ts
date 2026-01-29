import {IsBoolean, IsOptional, IsString, IsUUID} from "class-validator";

export class PromptDto {
  @IsUUID()
  @IsOptional()
  id?: string;

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