/*
  Warnings:

  - The values [Delete] on the enum `GalleryPhotoChangeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AIArtifactImageChangeType" AS ENUM ('Create', 'Update');

-- AlterEnum
BEGIN;
CREATE TYPE "GalleryPhotoChangeType_new" AS ENUM ('Create', 'Update');
ALTER TABLE "GalleryPhotoHistory" ALTER COLUMN "changeType" TYPE "GalleryPhotoChangeType_new" USING ("changeType"::text::"GalleryPhotoChangeType_new");
ALTER TYPE "GalleryPhotoChangeType" RENAME TO "GalleryPhotoChangeType_old";
ALTER TYPE "GalleryPhotoChangeType_new" RENAME TO "GalleryPhotoChangeType";
DROP TYPE "public"."GalleryPhotoChangeType_old";
COMMIT;

-- AlterTable
ALTER TABLE "AIArtifact" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "AIArtifactImageHistory" (
    "id" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePrompt" TEXT,
    "changeType" "AIArtifactImageChangeType" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIArtifactImageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIArtifactImageHistory_artifactId_changedAt_idx" ON "AIArtifactImageHistory"("artifactId", "changedAt");

-- AddForeignKey
ALTER TABLE "AIArtifactImageHistory" ADD CONSTRAINT "AIArtifactImageHistory_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "AIArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
