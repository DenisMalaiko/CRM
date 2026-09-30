-- Delete existing NicheNews rows since they are agency-scoped and cannot be mapped to a specific business
DELETE FROM "NicheNews";

-- Drop old agency relation
ALTER TABLE "NicheNews" DROP CONSTRAINT "NicheNews_agencyId_fkey";
DROP INDEX "NicheNews_agencyId_industry_idx";
ALTER TABLE "NicheNews" DROP COLUMN "agencyId";
DROP INDEX "NicheNews_url_key";

-- Add businessId column and new unique constraint
ALTER TABLE "NicheNews" ADD COLUMN "businessId" TEXT NOT NULL;
ALTER TABLE "NicheNews" ADD CONSTRAINT "NicheNews_business_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "NicheNews_businessId_url_key" ON "NicheNews"("businessId", "url");
CREATE INDEX "NicheNews_businessId_industry_idx" ON "NicheNews"("businessId", "industry");

-- Add nicheNewsId to IdeaAI
ALTER TABLE "IdeaAI" ADD COLUMN "nicheNewsId" TEXT;
ALTER TABLE "IdeaAI" ADD CONSTRAINT "IdeaAI_nicheNewsId_fkey" FOREIGN KEY ("nicheNewsId") REFERENCES "NicheNews"("id") ON DELETE SET NULL ON UPDATE CASCADE;
