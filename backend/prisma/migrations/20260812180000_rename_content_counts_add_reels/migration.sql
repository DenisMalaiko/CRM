-- AlterTable: rename content type count columns
ALTER TABLE "InstagramReport" RENAME COLUMN "imageCount" TO "postsImageCount";
ALTER TABLE "InstagramReport" RENAME COLUMN "videoCount" TO "postsVideoCount";
ALTER TABLE "InstagramReport" RENAME COLUMN "carouselCount" TO "postsCarouselCount";

-- AlterTable: add reels count
ALTER TABLE "InstagramReport" ADD COLUMN "reels" INTEGER NOT NULL DEFAULT 0;
