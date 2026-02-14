-- CreateEnum
CREATE TYPE "PlatformList" AS ENUM ('Facebook', 'Instagram', 'Tiktok');

-- CreateTable
CREATE TABLE "CompetitorPost" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "PlatformList" NOT NULL,
    "competitorId" TEXT NOT NULL,
    "text" TEXT,
    "url" TEXT,
    "media" JSONB,
    "likes" INTEGER,
    "shares" INTEGER,
    "viewsCount" INTEGER,
    "postedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorPost_competitorId_idx" ON "CompetitorPost"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorPost_platform_idx" ON "CompetitorPost"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorPost_externalId_platform_competitorId_key" ON "CompetitorPost"("externalId", "platform", "competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
