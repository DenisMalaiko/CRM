import { BusinessIndustry } from "../enum/BusinessIndustry";
import { Tiers } from "../enum/Tiers";

export type TBusiness = {
  id?: string;
  name: string;
  industry: BusinessIndustry;
  tier: Tiers;
}