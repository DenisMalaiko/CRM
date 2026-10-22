import { ContentPlanStatus } from "../enum/ContentPlanStatus";

export type TContentPlan = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: ContentPlanStatus;
  mode: "manual";
  createdAt: Date;
}

export type TContentPlanGenerate =
  | {
      mode: "manual";
      productsIds?: string[];
      audiencesIds?: string[];
      ideasIds?: string[];
    }
  | {
      mode: "marketing_calendar";
      productsIds?: string[];
      audiencesIds?: string[];
      holidayName: string;
      holidayDate: string;
    };

export type TContentPlanUpdate = {
  title?: string;
  description?: string;
  status?: ContentPlanStatus;
}

export type TContentPlanPost = {
  day: number;
  date: string;
  funnelStage: "TOFU" | "MOFU" | "BOFU";
  format: string;
  contentType: string;
  topic: string;
  marketingGoal: string;
  title: string;
  hook: string;
  thesis: string;
  cta: string;
  designReference: string;
}
