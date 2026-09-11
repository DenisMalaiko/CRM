-- AlterTable
ALTER TABLE "FacebookReport" ADD COLUMN     "topAdTexts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topAds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topPostTexts" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "topPosts" JSONB NOT NULL DEFAULT '[]';
