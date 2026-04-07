import { IdeaWho, IdeaWhat, IdeaWhy, IdeaHow, IdeaFeeling, IdeaStatus } from "@prisma/client";

export type TIdeaAI = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  who: IdeaWho;
  what: IdeaWhat;
  why: IdeaWhy;
  how: IdeaHow;
  feeling: IdeaFeeling;
  createdAt: Date;
  status: IdeaStatus;
}

export type TIdeaAIUpdate = {
  status: IdeaStatus;
}