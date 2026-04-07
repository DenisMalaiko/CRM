import { IdeaStatus } from "../enum/IdeaStatus";

export type TIdeaAI = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  who: string;
  what: string;
  why: string;
  how: string;
  feeling: string;
  createdAt: Date;
  status: IdeaStatus;
}

export type TIdeaAIUpdate = {
  status: IdeaStatus;
}