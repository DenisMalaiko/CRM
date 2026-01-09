import {IsString, IsNumber, IsArray, IsBoolean} from "class-validator";

export class PlatformDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  trendRefreshRate: number;

  @IsArray()
  supportedFormats: string[];

  @IsBoolean()
  isActive: boolean;
}