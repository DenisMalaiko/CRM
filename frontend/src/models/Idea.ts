import { IdeaStatus } from "../enum/IdeaStatus";
import { IdeaSourceType } from "../enum/IdeaSourceType";

export type TIdea = {
  id: string;
  businessId: string;
  competitorId: string;
  competitorPostId: string;
  sourceType: IdeaSourceType;
  sourceId: string;
  title: string;
  description: string;
  who: string;
  what: string;
  why: string;
  how: string;
  feeling: string;
  score: number;
  createdAt: Date;
  status: IdeaStatus;
}

export type TIdeaParams = {
  onlyPostsNewerThan: Date;
  sourceType?: IdeaSourceType;
}

export type TIdeaUpdate = {
  status: IdeaStatus;
}