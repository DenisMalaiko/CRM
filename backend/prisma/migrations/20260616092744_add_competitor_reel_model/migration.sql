-- CreateTable
CREATE TABLE "CompetitorReel" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "PlatformList" NOT NULL,
    "competitorId" TEXT NOT NULL,
    "text" TEXT,
    "url" TEXT,
    "media" JSONB,
    "likes" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "views" INTEGER,
    "plays" INTEGER,
    "postedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorReel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorReel_competitorId_idx" ON "CompetitorReel"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorReel_platform_idx" ON "CompetitorReel"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorReel_externalId_platform_competitorId_key" ON "CompetitorReel"("externalId", "platform", "competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorReel" ADD CONSTRAINT "CompetitorReel_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
