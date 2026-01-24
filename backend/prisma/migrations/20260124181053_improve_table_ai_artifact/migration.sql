/*
  Warnings:

  - You are about to drop the column `inputHash` on the `AIArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `AIArtifact` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AIArtifact" DROP CONSTRAINT "AIArtifact_productId_fkey";

-- AlterTable
ALTER TABLE "AIArtifact" DROP COLUMN "inputHash",
DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "AIArtifactProduct" (
    "aiArtifactId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "AIArtifactProduct_pkey" PRIMARY KEY ("aiArtifactId","productId")
);

-- CreateTable
CREATE TABLE "BusinessProfilePlatform" (
    "businessProfileId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BusinessProfilePlatform_pkey" PRIMARY KEY ("businessProfileId","platformId")
);

-- AddForeignKey
ALTER TABLE "AIArtifactProduct" ADD CONSTRAINT "AIArtifactProduct_aiArtifactId_fkey" FOREIGN KEY ("aiArtifactId") REFERENCES "AIArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifactProduct" ADD CONSTRAINT "AIArtifactProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePlatform" ADD CONSTRAINT "BusinessProfilePlatform_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePlatform" ADD CONSTRAINT "BusinessProfilePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
