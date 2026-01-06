import { TBusiness } from "./Business";

export type TBusinessProfile = {
  id: number;
  businessId: string;
  name: string;
  positioning: string;
  toneOfVoice: string;
  brandRules: string;
  goals: string[];
  isActive: boolean;
  createdAt: Date;


  business?: TBusiness;
}

export type TBusinessProfileCreate = Omit<TBusinessProfile, "id" | "createdAt" | "business">