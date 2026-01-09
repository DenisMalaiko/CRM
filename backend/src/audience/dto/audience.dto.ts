import { IsString, IsArray, IsOptional } from "class-validator";

export class AudienceDto {
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