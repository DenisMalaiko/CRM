import { TBaseModel } from "../../../shared/entities/BaseEntity";
import { TAgency } from "../../agency/entities/agency.entity";
import { BusinessStatus } from "@prisma/client";

export type TBusinessBase = {
  name: string;
  website: string;
  facebookLink?: string | null;
  instagramLink?: string | null;
  industry?: string | null;
  status: BusinessStatus;
  language: string;
  country: string;
  brand: string;
  advantages: string[];
  goals: string[];
}

export type TBusiness = TBaseModel & TBusinessBase & {
  createdAt: Date;
  agency?: TAgency;
};

export type TBusinessCreate = TBusinessBase & {
  agencyId: string;
}

export type TBusinessUpdate = TBusinessBase & {
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
  adsCarouselCount: number;
  adsDcoCount: number;
  adsCtaWebsite: number;
  adsCtaDirectMessage: number;
  adsCtaInstagramPage: number;
  adsCtaProduct: number;
  adsCtaMetaPage: number;
  topPosts: any;
  topPostTexts: any;
  topAds: any;
  topAdTexts: any;
  fetchedAt: Date;
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
  fetchedAt: Date;
}
