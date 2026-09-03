export type TCompetitorBase = {
  businessId: string;
  name: string;
  facebookLink: string;
  instagramLink: string;
  facebookPageId?: string;
  isActive: boolean;
}

export type TCompetitor = TCompetitorBase & {
  id: string;
  createdAt: Date;
}

export type TCompetitorCreate = TCompetitorBase;

export type TCompetitorUpdate = TCompetitorBase;

export type TCompetitorInstagramReport = {
  id: string;
  competitorId: string;
  followers: number;
  posts: number;
  reels: number;
  stories: number;
  fetchedAt: string;
}

export type TTopAdText = {
  text: string;
  collationCount: number;
  url: string | null;
}

export type TCompetitorFacebookReport = {
  id: string;
  competitorId: string;
  followers: number;
  posts: number;
  ads: number;
  ads30d: number;
  topAdTexts: TTopAdText[];
  fetchedAt: string;
}

export type TCompetitorWithReport = TCompetitor & {
  instagramReport: TCompetitorInstagramReport | null;
  facebookReport: TCompetitorFacebookReport | null;
}

export type TCompetitorPostParams = {
  onlyPostsNewerThan: Date;
}

export type TCompetitorAdsParams = {
  activeStatus: string;
  period: string;
  sortBy: string;
}