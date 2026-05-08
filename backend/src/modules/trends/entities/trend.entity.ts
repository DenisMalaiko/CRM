type TTrendBase = {
  businessId: string;
  platformId: string;
  source: string;
  title: string;
  description: string;
  format: string;
  keywords: string[];
  publishedAt: Date;
  metrics: Record<string, unknown>;
};

export type TTrend = TTrendBase & { id: string; createdAt: Date };
export type TTrendCreate = TTrendBase;
export type TTrendUpdate = Partial<TTrendBase>;
export type TTrendMatch = {
  businessProfileId: string;
  trendId: string;
  relevanceScore: number;
  matchedAt: Date;
};
