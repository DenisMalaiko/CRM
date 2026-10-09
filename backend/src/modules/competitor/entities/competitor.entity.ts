import { TStrategicInsight } from '../../ai/schema/strategic-insights.schema';

type TCompetitorBase = {
  businessId: string;
  name: string;
  facebookLink: string;
  instagramLink: string;
  isActive: boolean;
};

export type TCompetitor = TCompetitorBase & {
  id: string;
  createdAt: Date;
};

export type TCompetitorCreate = TCompetitorBase;

export type TCompetitorUpdate = TCompetitorBase;

export type TCompetitorInstagramReport = {
  id: string;
  competitorId: string;
  followers: number;
  posts: number;
  reels: number;
  stories: number;
  fetchedAt: Date;
};

export type TCompetitorPostParams = {
  onlyPostsNewerThan: string;
};

export type TCompetitorAdsParams = {
  activeStatus: string;
  period: string;
  sortBy: string;
};

export type TCompetitorFacebookReport = {
  id: string;
  competitorId: string;
  followers: number;
  posts: number;
  postsImageCount: number;
  postsVideoCount: number;
  postsCarouselCount: number;
  ads: number;
  ads30d: number;
  adsVideoCount: number;
  adsImageCount: number;
  adsCarouselCount: number;
  adsDcoCount: number;
  adsCtaWebsite: number;
  adsCtaDirectMessage: number;
  adsCtaInstagramPage: number;
  adsCtaProduct: number;
  adsCtaMetaPage: number;
  topAdTexts: { text: string; collationCount: number; url: string }[];
  topAds: { text: string; collationCount: number; url: string }[];
  topPostTexts: { text: string; collationCount: number; url: string }[];
  topPosts: { text: string; collationCount: number; url: string }[];
  strategicInsights: TStrategicInsight[];
  fetchedAt: Date;
};
