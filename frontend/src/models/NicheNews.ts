import { TBaseModel } from "./BaseModel";
import { TIdeaAI } from "./IdeaAI";

export type TNicheNews = TBaseModel & {
  title: string;
  summary: string;
  url: string;
  source: string;
  industry: string;
  publishedAt: string;
  ideasAI?: TIdeaAI[];
};
