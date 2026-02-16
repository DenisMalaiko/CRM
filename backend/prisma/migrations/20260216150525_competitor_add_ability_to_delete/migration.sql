-- DropForeignKey
ALTER TABLE "CompetitorAds" DROP CONSTRAINT "CompetitorAds_competitorId_fkey";

-- DropForeignKey
ALTER TABLE "CompetitorPost" DROP CONSTRAINT "CompetitorPost_competitorId_fkey";

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorAds" ADD CONSTRAINT "CompetitorAds_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
