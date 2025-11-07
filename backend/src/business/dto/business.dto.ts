import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessIndustryUI } from "../../enums/BusinessIndustry";
import { TiersUI } from "../../enums/Tiers";

export class BusinessDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsEnum(BusinessIndustryUI)
  industry: BusinessIndustryUI;

  @IsEnum(TiersUI)
  tier: TiersUI;
}