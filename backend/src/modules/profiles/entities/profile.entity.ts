import { TProduct } from "../../products/entities/product.entity";
import { TAudience } from "../../audience/entity/audience.entity";
import { TBusiness } from "../../business/entities/business.entity";
import { TPrompt } from "../../prompt/entities/prompt.entity";
import { TGalleryPhoto, TDefaultGalleryPhoto } from "../../gallery/entities/gallery.entity";
import { TIdea } from "../../idea/entities/idea.entity";
import { ProfileFocus } from "@prisma/client"

type TProfileBase = {
  businessId: string;
  name: string;
  profileFocus: ProfileFocus;
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
  defaultPhotos: TDefaultGalleryPhoto[];
  business?: TBusiness;
}

export type TProfileCreate = TProfileBase & {
  audiencesIds: string[];
  productsIds?: string[];
  ideasIds?: string[];
  promptsIds?: string[];
  photosIds?: string[];
  defaultPhotosIds?: string[];
}

export type TProfileUpdate = TProfileBase & {
  audiencesIds: string[];
  productsIds?: string[];
  ideasIds?: string[];
  promptsIds?: string[];
  photosIds?: string[];
  defaultPhotosIds?: string[];
}