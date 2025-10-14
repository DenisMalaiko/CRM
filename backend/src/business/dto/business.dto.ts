import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessIndustry } from "../../enums/BusinessIndustry";
import { Tiers } from "../../enums/Tiers";

export class BusinessDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsEnum(BusinessIndustry)
  industry: BusinessIndustry;

  @IsEnum(Tiers)
  tier: Tiers;
}