import { TProduct } from "../../products/entities/product.entity";
import { TAudience } from "../../audience/entity/audience.entity";
import { TBusiness } from "../../business/entities/business.entity";
import { TPrompt } from "../../prompt/entities/prompt.entity";
import { TGalleryPhoto } from "../../gallery/entities/gallery.entity";
import { TIdea } from "../../idea/entities/idea.entity";

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
  ideas: TIdea[];
  prompts: TPrompt[];
  photos: TGalleryPhoto[];
  business?: TBusiness;
}

export type TProfileCreate = TProfileBase & {
  audiencesIds: string[];
  productsIds?: string[];
  ideasIds?: string[];
  promptsIds?: string[];
  photosIds?: string[];
}

export type TProfileUpdate = TProfileBase & {
  audiencesIds: string[];
  productsIds?: string[];
  ideasIds?: string[];
  promptsIds?: string[];
  photosIds?: string[];
}