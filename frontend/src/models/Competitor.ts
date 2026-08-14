export type TCompetitorBase = {
  businessId: string;
  name: string;
  facebookLink: string;
  instagramLink: string;
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

export type TCompetitorWithReport = TCompetitor & {
  instagramReport: TCompetitorInstagramReport | null;
}

export type TCompetitorPostParams = {
  onlyPostsNewerThan: Date;
}

export type TCompetitorAdsParams = {
  activeStatus: string;
  period: string;
  sortBy: string;
}