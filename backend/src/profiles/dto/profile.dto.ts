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
  profileFocus: string;

  @IsArray()
  productsIds: string[];

  @IsArray()
  audiencesIds: string[];

  @IsArray()
  platformsIds: string[];

  @IsBoolean()
  isActive: boolean;
}