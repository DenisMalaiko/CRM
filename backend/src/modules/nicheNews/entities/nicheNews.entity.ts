import { TBaseModel } from '../../../shared/entities/BaseEntity';

export type TNicheNews = TBaseModel & {
  title: string;
  summary: string;
  url: string;
  source: string;
  industry: string;
  publishedAt: Date;
};
