import { Tiers } from '../../generated/prisma';

export enum TiersUI {
  Free = "Free",
  Basic = "Basic",
  Premium = "Premium",
}

export const TiersToPrisma: Record<TiersUI, Tiers> = {
  [TiersUI.Free]: TiersUI.Free,
  [TiersUI.Basic]: TiersUI.Basic,
  [TiersUI.Premium]: TiersUI.Premium,
}