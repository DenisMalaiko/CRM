import {IsString, IsUUID, IsEnum, IsArray, IsOptional, IsInt, Min} from "class-validator";
import { BusinessStatusUI } from "../../../shared/enums/BusinessStatus";

export class BusinessBaseDto {
  @IsUUID()
  agencyId: string;

  @IsString()
  name: string;

  @IsString()
  website: string;

  @IsString()
  @IsOptional()
  facebookLink?: string;

  @IsString()
  @IsOptional()
  instagramLink?: string;

  @IsString()
  industry: string;

  @IsEnum(BusinessStatusUI)
  status: BusinessStatusUI;

  @IsString()
  language: string;

  @IsString()
  country: string;

  @IsString()
  brand: string;

  @IsArray()
  advantages: string[];

  @IsArray()
  goals: string[];
}

export class CreateBusinessDto extends BusinessBaseDto {}

export class UpdateBusinessDto extends BusinessBaseDto {}

export class BusinessIdParamDto {
  @IsUUID()
  id: string;
}

export class ReportDto {
  @IsInt()
  @Min(0)
  followers: number;

  @IsInt()
  @Min(0)
  posts: number;
}
