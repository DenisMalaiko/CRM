ALTER TABLE "FacebookReport" ADD COLUMN "strategicInsights" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "InstagramReport" ADD COLUMN "strategicInsights" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "CompetitorInstagramReport" ADD COLUMN "strategicInsights" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "CompetitorFacebookReport" ADD COLUMN "strategicInsights" JSONB NOT NULL DEFAULT '[]';
