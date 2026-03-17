import {IsOptional, IsString, IsUUID, IsArray, IsBoolean, IsEnum} from "class-validator";
import { ProfileFocus } from "@prisma/client"

export class ProfileBaseDto {
  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  name: string;

  @IsEnum(ProfileFocus)
  profileFocus: ProfileFocus;

  @IsArray()
  @IsOptional()
  audiencesIds: string[];

  @IsArray()
  @IsOptional()
  productsIds: string[];

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

  @IsBoolean()
  isActive: boolean;
}

export class CreateProfileDto extends ProfileBaseDto {}

export class UpdateProfileDto extends ProfileBaseDto {}

export class ProfileIdParamDto {
  @IsUUID()
  id: string;
}