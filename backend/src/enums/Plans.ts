import { Plan } from '../../generated/prisma';

export enum PlansUI {
  Free = "Free",
  Basic = "Basic",
  Premium = "Premium",
}

/*
export const PlansToPrisma: Record<PlansUI, Plan> = {
  [PlansUI.Free]: Plan.Free,
  [PlansUI.Basic]: Plan.Basic,
  [PlansUI.Premium]: Plan.Premium,
}*/
