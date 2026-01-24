/*
  Warnings:

  - Added the required column `businessId` to the `AIArtifact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIArtifact" ADD COLUMN     "businessId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "AIArtifact_businessId_idx" ON "AIArtifact"("businessId");
