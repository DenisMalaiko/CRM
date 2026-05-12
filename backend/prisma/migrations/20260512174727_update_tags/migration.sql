/*
  Warnings:

  - You are about to drop the column `businessId` on the `Tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[type,normalizedValue]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addedBy` to the `BusinessProfileTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TagSource" AS ENUM ('User', 'API', 'Competitor', 'Trend', 'AI');

-- AlterTable
ALTER TABLE "BusinessProfileTag" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "addedBy" "TagSource" NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "businessId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "source" "TagSource" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "AIArtifactTag" (
    "aiArtifactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "AIArtifactTag_pkey" PRIMARY KEY ("aiArtifactId","tagId")
);

-- CreateIndex
CREATE INDEX "AIArtifactTag_tagId_idx" ON "AIArtifactTag"("tagId");

-- CreateIndex
CREATE INDEX "BusinessProfileTag_tagId_idx" ON "BusinessProfileTag"("tagId");

-- CreateIndex
CREATE INDEX "Tag_type_idx" ON "Tag"("type");

-- CreateIndex
CREATE INDEX "Tag_normalizedValue_idx" ON "Tag"("normalizedValue");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_type_normalizedValue_key" ON "Tag"("type", "normalizedValue");

-- AddForeignKey
ALTER TABLE "AIArtifactTag" ADD CONSTRAINT "AIArtifactTag_aiArtifactId_fkey" FOREIGN KEY ("aiArtifactId") REFERENCES "AIArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifactTag" ADD CONSTRAINT "AIArtifactTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
