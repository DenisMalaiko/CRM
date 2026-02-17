import { TBaseModel } from "./BaseModel";
import { TAgency } from "./Agency";
import { TProduct } from "./Product";
import { TBusinessProfile } from "./BusinessProfile";
import { BusinessStatus } from "../enum/BusinessStatus";

export type TBusiness = TBaseModel & {
  name: string;
  website: string;
  industry: string;
  status: BusinessStatus;


  brand: string;
  goals: string[];
  advantages: string[];

  agency?: TAgency;
  products?: TProduct[];
  businessProfiles?: TBusinessProfile[];
}

export type TBusinessCreate = {
  name: string;
  website: string;
  industry: string;
  status: BusinessStatus;
  agencyId: string;

  brand: string;
  goals: string[];
  advantages: string[];
}