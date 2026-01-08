import { TBusiness } from "./Business";

export type TBusinessProfile = {
  id: string;
  businessId: string;
  name: string;
  profileFocus: string;
  isActive: boolean;
  createdAt: Date;
  business?: TBusiness;
}

export type TBusinessProfileCreate = Omit<TBusinessProfile, "id" | "createdAt" | "business">