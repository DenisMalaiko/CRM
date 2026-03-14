-- CreateTable
CREATE TABLE "DefaultPhoto" (
    "id" TEXT NOT NULL,
    "type" "GalleryPhotoType" NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "DefaultPhoto_pkey" PRIMARY KEY ("id")
);
