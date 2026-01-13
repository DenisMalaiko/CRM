import {IsString, IsNumber, IsArray, IsBoolean, IsUUID, IsOptional} from "class-validator";

export class PlatformDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  businessId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  @IsOptional()
  trendRefreshRate: number;

  @IsArray()
  @IsOptional()
  supportedFormats: string[];

  @IsBoolean()
  isActive: boolean;
}