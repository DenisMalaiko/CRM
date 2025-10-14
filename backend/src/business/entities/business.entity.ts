import { BusinessIndustry } from "../../enums/BusinessIndustry";
import { Tiers } from "../../enums/Tiers";

export type Business = {
  id?: string;
  name: string;
  industry: BusinessIndustry | string;
  tier: Tiers | string;
}

export type BusinessResponse = Partial<Business>