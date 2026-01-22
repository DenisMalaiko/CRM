/*
  Warnings:

  - You are about to drop the `BusinessProfilePlatform` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BusinessProfilePlatform" DROP CONSTRAINT "BusinessProfilePlatform_businessProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BusinessProfilePlatform" DROP CONSTRAINT "BusinessProfilePlatform_platformId_fkey";

-- DropTable
DROP TABLE "public"."BusinessProfilePlatform";
