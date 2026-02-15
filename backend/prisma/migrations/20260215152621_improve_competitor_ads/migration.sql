/*
  Warnings:

  - You are about to drop the `CompetitorPostAds` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CompetitorPostAds";

-- CreateTable
CREATE TABLE "CompetitorAds" (
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

    CONSTRAINT "CompetitorAds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorAds_competitorId_idx" ON "CompetitorAds"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorAds_platform_idx" ON "CompetitorAds"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorAds_externalId_platform_competitorId_key" ON "CompetitorAds"("externalId", "platform", "competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorAds" ADD CONSTRAINT "CompetitorAds_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
