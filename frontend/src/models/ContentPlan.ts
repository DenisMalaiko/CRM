import { ContentPlanStatus } from "../enum/ContentPlanStatus";

export type TContentPlan = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: ContentPlanStatus;
  mode: "manual" | "profile";
  createdAt: Date;
}

export type TContentPlanGenerate = {
  mode: "manual" | "profile";
  productsIds?: string[];
  audiencesIds?: string[];
  ideasIds?: string[];
  context?: string;
}

export type TContentPlanUpdate = {
  title?: string;
  description?: string;
  status?: ContentPlanStatus;
}
