type TCompetitorBase = {
  businessId: string;
  name: string;
  facebookLink: string;
  instagramLink: string;
  isActive: boolean;
}

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
}

export type TCompetitorPostParams = {
  onlyPostsNewerThan: string;
}

export type TCompetitorAdsParams = {
  activeStatus: string;
  period: string;
  sortBy: string;
}