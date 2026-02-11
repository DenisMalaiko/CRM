import { TProduct } from "../../products/entities/product.entity";
import { TAudience } from "../../audience/entity/audience.entity";
import { TBusiness } from "../../business/entities/business.entity";
import { TPrompt } from "../../prompt/entities/prompt.entity";

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
  audiences: TAudience[];
  prompts: TPrompt[];
  business?: TBusiness;
}

export type TProfileCreate = TProfileBase & {
  productsIds: string[];
  audiencesIds: string[];
  promptsIds: string[];
}

export type TProfileUpdate = TProfileBase & {
  productsIds: string[];
  audiencesIds: string[];
  promptsIds: string[];
}