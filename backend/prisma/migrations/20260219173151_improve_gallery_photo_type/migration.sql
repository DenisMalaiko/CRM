/*
  Warnings:

  - Changed the type of `type` on the `GalleryPhoto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "GalleryPhotoType" AS ENUM ('Image', 'Post');

UPDATE "GalleryPhoto"
SET "type" = 'Image'
WHERE "type" NOT IN ('Image', 'Post');

-- AlterTable
ALTER TABLE "GalleryPhoto"
ALTER COLUMN "type"
TYPE "GalleryPhotoType"
USING "type"::"GalleryPhotoType";
