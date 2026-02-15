/*
  Warnings:

  - You are about to drop the column `viewsCount` on the `CompetitorPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompetitorPost" DROP COLUMN "viewsCount",
ADD COLUMN     "views" INTEGER;

-- CreateTable
CREATE TABLE "CompetitorPostAds" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "PlatformList" NOT NULL,
    "competitorId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "caption" TEXT,
    "url" TEXT,
    "format" TEXT,
    "ctaText" TEXT,
    "ctaType" TEXT,
    "videos" JSONB,
    "images" JSONB,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "active_days" INTEGER,

    CONSTRAINT "CompetitorPostAds_pkey" PRIMARY KEY ("id")
);
