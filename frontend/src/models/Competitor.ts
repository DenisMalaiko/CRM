export type TCompetitorBase = {
  businessId: string;
  name: string;
  facebookLink: string;
  isActive: boolean;
}

export type TCompetitor = TCompetitorBase & {
  id: string;
  createdAt: Date;
}

export type TCompetitorCreate = TCompetitorBase;

export type TCompetitorUpdate = TCompetitorBase;

export type TCompetitorPostParams = {
  onlyPostsNewerThan: Date;
}