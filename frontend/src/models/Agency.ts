import { Tiers } from "../enum/Tiers";

export type TAgency = {
  id?: string;
  name: string;
  tier: Tiers;
}