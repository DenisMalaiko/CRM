-- AlterTable
ALTER TABLE "FacebookReport" ADD COLUMN     "postsCarouselCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "postsImageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "postsVideoCount" INTEGER NOT NULL DEFAULT 0;
