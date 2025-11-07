import { BusinessIndustryUI } from "../../enums/BusinessIndustry";
import { TiersUI } from "../../enums/Tiers";

export type Business = {
  id?: string;
  name: string;
  industry: BusinessIndustryUI | string;
  tier: TiersUI | string;
}

export type BusinessResponse = Partial<Business>