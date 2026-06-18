import {
  IdeaWho,
  IdeaWhat,
  IdeaWhy,
  IdeaHow,
  IdeaFeeling,
  IdeaStatus,
  IdeaSourceType,
} from '@prisma/client';

export type TIdeaParams = {
  onlyPostsNewerThan: string;
};

export type TIdea = {
  id: string;
  businessId: string;
  sourceType: IdeaSourceType;
  sourceId: string;
  competitorId: string;
  title: string;
  description: string;
  who: IdeaWho;
  what: IdeaWhat;
  why: IdeaWhy;
  how: IdeaHow;
  feeling: IdeaFeeling;
  score: number;
  postedAt: Date | null;
  createdAt: Date;
  status: IdeaStatus;
};

export class TIdeaUpdate {
  status: IdeaStatus;
}
