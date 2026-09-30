import { TBaseModel } from "./BaseModel";

export type TNicheNewsIdea = {
  id: string;
  title: string;
};

export type TNicheNews = TBaseModel & {
  title: string;
  summary: string;
  url: string;
  source: string;
  industry: string;
  publishedAt: string;
  ideasAI?: TNicheNewsIdea[];
};
