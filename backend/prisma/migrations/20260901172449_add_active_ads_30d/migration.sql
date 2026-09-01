-- AlterTable
ALTER TABLE "CompetitorFacebookReport" ADD COLUMN     "ads30d" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "FacebookReport" ADD COLUMN     "activeAds30d" INTEGER NOT NULL DEFAULT 0;
