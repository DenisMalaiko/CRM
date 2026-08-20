-- CreateTable
CREATE TABLE "CompetitorFacebookReport" (
    "id" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "posts" INTEGER NOT NULL DEFAULT 0,
    "ads" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetitorFacebookReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorFacebookReport_competitorId_key" ON "CompetitorFacebookReport"("competitorId");

-- AddForeignKey
ALTER TABLE "CompetitorFacebookReport" ADD CONSTRAINT "CompetitorFacebookReport_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
