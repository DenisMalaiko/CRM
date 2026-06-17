/*
  Warnings:

  - A unique constraint covering the columns `[businessId,sourceType,sourceId,competitorId]` on the table `Idea` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sourceId` to the `Idea` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceType` to the `Idea` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IdeaSourceType" AS ENUM ('FacebookPost', 'InstagramPost', 'InstagramReel', 'FacebookAd');

-- DropIndex
DROP INDEX "Idea_businessId_competitorPostId_competitorId_key";

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "competitorAdId" TEXT,
ADD COLUMN     "competitorReelId" TEXT,
ADD COLUMN     "sourceId" TEXT NOT NULL,
ADD COLUMN     "sourceType" "IdeaSourceType" NOT NULL,
ALTER COLUMN "competitorPostId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Idea_sourceType_idx" ON "Idea"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "Idea_businessId_sourceType_sourceId_competitorId_key" ON "Idea"("businessId", "sourceType", "sourceId", "competitorId");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_competitorReelId_fkey" FOREIGN KEY ("competitorReelId") REFERENCES "CompetitorReel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_competitorAdId_fkey" FOREIGN KEY ("competitorAdId") REFERENCES "CompetitorAds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
