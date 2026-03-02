import { IdeaWho, IdeaWhat, IdeaWhy, IdeaHow, IdeaFeeling, IdeaStatus} from "@prisma/client";

export type TIdeaParams = {
  onlyPostsNewerThan: string;
};

export type TIdea = {
  id: string;
  businessId: string;
  title: string;
  description: string;
  who: IdeaWho;
  what: IdeaWhat;
  why: IdeaWhy;
  how: IdeaHow;
  feeling: IdeaFeeling;
  score: number;
  createdAt: Date;
  status: IdeaStatus;
}

export class TIdeaUpdate {
  status: IdeaStatus;
}