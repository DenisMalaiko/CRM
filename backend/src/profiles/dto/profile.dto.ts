import {IsOptional, IsString, IsUUID, IsArray, IsBoolean, IsDate } from "class-validator";

export class ProfileDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  name: string;

  @IsString()
  positioning: string;

  @IsString()
  toneOfVoice: string;

  @IsOptional()
  @IsString()
  brandRules: string;

  @IsArray()
  goals: string[];

  @IsBoolean()
  isActive: boolean;
}