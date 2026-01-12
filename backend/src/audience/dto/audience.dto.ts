import {IsString, IsArray, IsOptional, IsUUID} from "class-validator";

export class AudienceDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  name: string;

  @IsString()
  ageRange: string;

  @IsString()
  gender: string;

  @IsString()
  geo: string;

  @IsArray()
  pains: string[];

  @IsArray()
  desires: string[];

  @IsArray()
  triggers: string[];

  @IsOptional()
  @IsString()
  incomeLevel?: string;
}