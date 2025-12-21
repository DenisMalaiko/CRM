import { Tiers } from 'prisma-client-0650b02a02e507ba4cbed796f9b27df37f09faff1e3a420a9969c52fff291492';

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