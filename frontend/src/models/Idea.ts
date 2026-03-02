import { IdeaStatus } from "../enum/IdeaStatus";

export type TIdea = {
  id: string;
  businessId: string;
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
}

export type TIdeaUpdate = {
  status: IdeaStatus;
}