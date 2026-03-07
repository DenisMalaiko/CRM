/*
  Warnings:

  - Changed the type of `profileFocus` on the `BusinessProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProfileFocus" AS ENUM ('GeneratePosts', 'GenerateStories');

-- normalize data first
UPDATE "BusinessProfile"
SET "profileFocus" = 'GeneratePosts'
WHERE "profileFocus" = 'Generate Posts';

-- AlterTable
ALTER TABLE "BusinessProfile"
ALTER COLUMN "profileFocus"
TYPE "ProfileFocus"
USING ("profileFocus"::"ProfileFocus");
