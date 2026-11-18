import { ContentPlanStatus } from "../enum/ContentPlanStatus";

export type TContentPlanRelated = {
  id: string;
  name: string;
};

export type TContentPlanRelatedIdea = {
  id: string;
  title: string;
};

export type TContentPlan = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  status: ContentPlanStatus;
  mode: "manual" | "marketing_calendar";
  holidayName?: string | null;
  holidayDate?: string | null;
  createdAt: Date;
  products: { product: TContentPlanRelated }[];
  audiences: { targetAudience: TContentPlanRelated }[];
  ideas: { idea: TContentPlanRelatedIdea }[];
  ideasAI: { ideaAI: TContentPlanRelatedIdea }[];
};

export type TContentPlanGenerate = {
  mode: "manual";
  productsIds?: string[];
  audiencesIds?: string[];
  ideasIds?: string[];
  holidayName?: string;
  holidayDate?: string;
  photosIds?: string[];
};

export type TContentPlanUpdate = {
  title?: string;
  description?: string;
  status?: ContentPlanStatus;
};

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
};

export type TContentPlanPostUpdate = Partial<Omit<TContentPlanPost, "day">>;
