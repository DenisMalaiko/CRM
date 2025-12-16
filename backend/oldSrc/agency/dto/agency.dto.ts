import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TiersUI } from "../../enums/Tiers";

export class AgencyDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsEnum(TiersUI)
  tier: TiersUI;
}