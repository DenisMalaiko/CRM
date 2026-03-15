-- AlterTable
ALTER TABLE "DefaultPhoto" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "BusinessProfileDefaultPhoto" (
    "businessProfileId" TEXT NOT NULL,
    "defaultPhotoId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfileDefaultPhoto_pkey" PRIMARY KEY ("businessProfileId","defaultPhotoId")
);

-- CreateIndex
CREATE INDEX "BusinessProfileDefaultPhoto_defaultPhotoId_idx" ON "BusinessProfileDefaultPhoto"("defaultPhotoId");

-- CreateIndex
CREATE INDEX "BusinessProfileDefaultPhoto_businessProfileId_idx" ON "BusinessProfileDefaultPhoto"("businessProfileId");

-- AddForeignKey
ALTER TABLE "BusinessProfileDefaultPhoto" ADD CONSTRAINT "BusinessProfileDefaultPhoto_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileDefaultPhoto" ADD CONSTRAINT "BusinessProfileDefaultPhoto_defaultPhotoId_fkey" FOREIGN KEY ("defaultPhotoId") REFERENCES "DefaultPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
