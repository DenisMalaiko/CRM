import { IsOptional, IsString, IsUUID, IsArray, IsBoolean } from "class-validator";

export class ProfileBaseDto {
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
  @IsOptional()
  promptsIds: string[];

  @IsBoolean()
  isActive: boolean;
}

export class CreateProfileDto extends ProfileBaseDto {}

export class UpdateProfileDto extends ProfileBaseDto {}

export class ProfileIdParamDto {
  @IsUUID()
  id: string;
}