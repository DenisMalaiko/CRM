import { TBusiness } from "./Business";
import { TProduct } from "./Product";
import { TPlatform } from "./Platform";
import { TAudience } from "./Audience";

type TBusinessProfileBase = {
  businessId: string;
  name: string;
  profileFocus: string;
  isActive: boolean;
};

export type TBusinessProfile = TBusinessProfileBase & {
  id: string;
  createdAt: Date;
  products: TProduct[];
  platforms: TPlatform[];
  audiences: TAudience[];
  /*business?: TBusiness;*/
};

export type TBusinessProfileCreate = TBusinessProfileBase & {
  productsIds: string[];
  /*platformsIds: string[];*/
  audiencesIds: string[];
};