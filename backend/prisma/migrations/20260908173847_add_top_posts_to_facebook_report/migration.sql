-- AlterTable
ALTER TABLE "CompetitorFacebookReport" ADD COLUMN     "topPostTexts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topPosts" JSONB NOT NULL DEFAULT '[]';
