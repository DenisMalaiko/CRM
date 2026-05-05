-- CreateEnum
CREATE TYPE "GalleryPhotoChangeType" AS ENUM ('Create', 'Update', 'Delete');

-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "GalleryPhotoHistory" (
    "id" TEXT NOT NULL,
    "photoId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "GalleryPhotoType" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "changeType" "GalleryPhotoChangeType" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryPhotoHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryPhotoHistory_photoId_changedAt_idx" ON "GalleryPhotoHistory"("photoId", "changedAt");

-- CreateIndex
CREATE INDEX "GalleryPhoto_businessId_idx" ON "GalleryPhoto"("businessId");

-- AddForeignKey
ALTER TABLE "GalleryPhotoHistory" ADD CONSTRAINT "GalleryPhotoHistory_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "GalleryPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
