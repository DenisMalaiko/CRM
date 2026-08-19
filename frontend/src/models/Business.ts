import { TBaseModel } from "./BaseModel";
import { TAgency } from "./Agency";
import { TProduct } from "./Product";
import { TBusinessProfile } from "./BusinessProfile";
import { BusinessStatus } from "../enum/BusinessStatus";

export type TBusiness = TBaseModel & {
  name: string;
  website: string;
  facebookLink?: string;
  instagramLink?: string;
  industry: string;
  status: BusinessStatus;
  language: string;
  country: string;

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
  facebookLink?: string;
  instagramLink?: string;
  industry: string;
  status: BusinessStatus;
  language: string;
  country: string;

  brand: string;
  goals: string[];
  advantages: string[];

  agencyId: string;
}

export type TFacebookReport = {
  id: string;
  businessId: string;
  followers: number;
  posts: number;
  postsImageCount: number;
  postsVideoCount: number;
  postsCarouselCount: number;
  likes: number;
  activeAds: number;
  adsVideoCount: number;
  adsImageCount: number;
  adsOtherCount: number;
  adsCtaWebsite: number;
  adsCtaDirectMessage: number;
  adsCtaInstagramPage: number;
  adsCtaProduct: number;
  adsCtaMetaPage: number;
  fetchedAt: string;
}

export type TInstagramReport = {
  id: string;
  businessId: string;
  followers: number;
  posts: number;
  postsImageCount: number;
  postsVideoCount: number;
  postsCarouselCount: number;
  reels: number;
  stories: number;
  storiesImageCount: number;
  storiesVideoCount: number;
  fetchedAt: string;
}