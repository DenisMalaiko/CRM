import { TiersUI } from "../../enums/Tiers";

export type Agency = {
  id?: string;
  name: string;
  tier: TiersUI | string;
}

export type AgencyResponse = Partial<Agency>