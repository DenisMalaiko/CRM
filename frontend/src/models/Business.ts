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
}