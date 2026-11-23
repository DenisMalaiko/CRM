import { ContentPlanStatus } from "../enum/ContentPlanStatus";
import { TColorToken } from "./DesignSystem";
import { ContentPlanPostFormat } from "../const/ContentFormats";

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
  designSystem?: { id: string; name: string; colors: TColorToken } | null;
};

export type TContentPlanGenerate = {
  mode: "manual";
  productsIds?: string[];
  audiencesIds?: string[];
  ideasIds?: string[];
  holidayName?: string;
  holidayDate?: string;
  photosIds?: string[];
  designSystemId?: string;
};

export type TContentPlanUpdate = {
  title?: string;
  description?: string;
  status?: ContentPlanStatus;
};

export type TContentPlanPostPhoto = {
  photoId: string;
  url: string;
};

export type TContentPlanPost = {
  day: number;
  date: string;
  funnelStage: "TOFU" | "MOFU" | "BOFU";
  format: ContentPlanPostFormat;
  contentType: string;
  topic: string;
  marketingGoal: string;
  title: string;
  hook: string;
  thesis: string;
  cta: string;
  designReference: string;
  photos?: TContentPlanPostPhoto[];
  overlayHtml?: string;
};

export type TContentPlanPostUpdate = Partial<Omit<TContentPlanPost, "day">> & {
  photosIds?: string[];
};
