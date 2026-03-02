import { TBusiness } from "./Business";
import { TProduct } from "./Product";
import { TPlatform } from "./Platform";
import { TAudience } from "./Audience";
import { TGalleryPhoto } from "./Gallery";
import { TIdea } from "./Idea";
import { TPrompt } from "./Prompt";

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
  ideas: TIdea[];
  prompts: TPrompt[];
  photos: TGalleryPhoto[];
  /*business?: TBusiness;*/
};

export type TBusinessProfileCreate = TBusinessProfileBase & {
  /*platformsIds: string[];*/
  audiencesIds: string[];
  productsIds?: string[];
  ideasIds?: string[];
  promptsIds?: string[];
  photosIds?: string[];
};