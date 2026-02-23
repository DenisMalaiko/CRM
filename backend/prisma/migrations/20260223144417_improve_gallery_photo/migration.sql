-- CreateTable
CREATE TABLE "BusinessProfilePhoto" (
    "businessProfileId" TEXT NOT NULL,
    "galleryPhotoId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfilePhoto_pkey" PRIMARY KEY ("businessProfileId","galleryPhotoId")
);

-- CreateIndex
CREATE INDEX "BusinessProfilePhoto_galleryPhotoId_idx" ON "BusinessProfilePhoto"("galleryPhotoId");

-- AddForeignKey
ALTER TABLE "BusinessProfilePhoto" ADD CONSTRAINT "BusinessProfilePhoto_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePhoto" ADD CONSTRAINT "BusinessProfilePhoto_galleryPhotoId_fkey" FOREIGN KEY ("galleryPhotoId") REFERENCES "GalleryPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
