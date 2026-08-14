-- CreateTable
CREATE TABLE "CompetitorInstagramReport" (
    "id" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "posts" INTEGER NOT NULL DEFAULT 0,
    "reels" INTEGER NOT NULL DEFAULT 0,
    "stories" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorInstagramReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorInstagramReport_competitorId_key" ON "CompetitorInstagramReport"("competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorInstagramReport" ADD CONSTRAINT "CompetitorInstagramReport_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
