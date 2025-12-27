import {IsOptional, IsString, IsUUID, IsEmail, IsBoolean, IsDate, IsEnum} from "class-validator";
import { BusinessStatusUI } from "../../enums/BusinessStatus";

export class BusinessDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  agencyId: string;

  @IsString()
  name: string;

  @IsString()
  website: string;

  @IsString()
  industry: string;

  @IsEnum(BusinessStatusUI)
  status: BusinessStatusUI = BusinessStatusUI.Active;
}

export class BusinessParamsDto {
  @IsUUID()
  id: string;
}