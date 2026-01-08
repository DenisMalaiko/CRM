/*
  Warnings:

  - You are about to drop the column `brandRules` on the `BusinessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `BusinessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `positioning` on the `BusinessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `toneOfVoice` on the `BusinessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `businessProfileId` on the `TargetAudience` table. All the data in the column will be lost.
  - Added the required column `profileFocus` to the `BusinessProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Platform` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `TargetAudience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Trend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BusinessProfilePlatform" DROP CONSTRAINT "BusinessProfilePlatform_businessProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BusinessProfilePlatform" DROP CONSTRAINT "BusinessProfilePlatform_platformId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BusinessProfileTag" DROP CONSTRAINT "BusinessProfileTag_businessProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BusinessProfileTag" DROP CONSTRAINT "BusinessProfileTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BusinessTrendMatch" DROP CONSTRAINT "BusinessTrendMatch_businessProfileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BusinessTrendMatch" DROP CONSTRAINT "BusinessTrendMatch_trendId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TargetAudience" DROP CONSTRAINT "TargetAudience_businessProfileId_fkey";

-- AlterTable
ALTER TABLE "BusinessProfile" DROP COLUMN "brandRules",
DROP COLUMN "goals",
DROP COLUMN "positioning",
DROP COLUMN "toneOfVoice",
ADD COLUMN  "profileFocus" TEXT NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "businessId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "businessId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TargetAudience" DROP COLUMN "businessProfileId",
ADD COLUMN     "businessId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Trend" ADD COLUMN     "businessId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BusinessProfileProduct" (
    "businessProfileId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfileProduct_pkey" PRIMARY KEY ("businessProfileId","productId")
);

-- CreateTable
CREATE TABLE "BusinessProfileTargetAudience" (
    "businessProfileId" TEXT NOT NULL,
    "targetAudienceId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfileTargetAudience_pkey" PRIMARY KEY ("businessProfileId","targetAudienceId")
);

-- AddForeignKey
ALTER TABLE "BusinessProfileProduct" ADD CONSTRAINT "BusinessProfileProduct_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileProduct" ADD CONSTRAINT "BusinessProfileProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTargetAudience" ADD CONSTRAINT "BusinessProfileTargetAudience_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTargetAudience" ADD CONSTRAINT "BusinessProfileTargetAudience_targetAudienceId_fkey" FOREIGN KEY ("targetAudienceId") REFERENCES "TargetAudience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePlatform" ADD CONSTRAINT "BusinessProfilePlatform_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePlatform" ADD CONSTRAINT "BusinessProfilePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTag" ADD CONSTRAINT "BusinessProfileTag_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTag" ADD CONSTRAINT "BusinessProfileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTrendMatch" ADD CONSTRAINT "BusinessTrendMatch_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTrendMatch" ADD CONSTRAINT "BusinessTrendMatch_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
