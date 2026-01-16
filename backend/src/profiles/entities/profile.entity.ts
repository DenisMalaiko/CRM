import { TProduct } from "../../products/entities/product.entity";
import { TPlatform } from "../../plaform/entity/platform.entity";
import { TAudience } from "../../audience/entity/audience.entity";
import { TBusiness } from "../../business/entities/business.entity";

type TProfileBase = {
  businessId: string;
  name: string;
  profileFocus: string;
  isActive: boolean;
};

export type TProfile = TProfileBase & {
  id: string;
  createdAt: Date;
  products: TProduct[];
  platforms: TPlatform[];
  audiences: TAudience[];
  business?: TBusiness;
}

export type TProfileCreate = TProfileBase & {
  productsIds: string[];
  audiencesIds: string[];
  platformsIds: string[];
};