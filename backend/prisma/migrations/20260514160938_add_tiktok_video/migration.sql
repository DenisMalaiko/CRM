-- CreateTable
CREATE TABLE "TiktokVideo" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "PlatformList" NOT NULL DEFAULT 'Tiktok',
    "text" TEXT,
    "textLanguage" TEXT,
    "url" TEXT NOT NULL,
    "coverUrl" TEXT,
    "authorExternalId" TEXT,
    "authorName" TEXT,
    "authorNickname" TEXT,
    "authorAvatarUrl" TEXT,
    "authorVerified" BOOLEAN NOT NULL DEFAULT false,
    "authorFollowers" INTEGER,
    "musicName" TEXT,
    "musicAuthor" TEXT,
    "musicOriginal" BOOLEAN NOT NULL DEFAULT false,
    "durationSec" INTEGER,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "collectCount" INTEGER NOT NULL DEFAULT 0,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isAd" BOOLEAN NOT NULL DEFAULT false,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "isSlideshow" BOOLEAN NOT NULL DEFAULT false,
    "searchQuery" TEXT,
    "raw" JSONB,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT,

    CONSTRAINT "TiktokVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TiktokVideo_businessId_idx" ON "TiktokVideo"("businessId");

-- CreateIndex
CREATE INDEX "TiktokVideo_searchQuery_idx" ON "TiktokVideo"("searchQuery");

-- CreateIndex
CREATE INDEX "TiktokVideo_publishedAt_idx" ON "TiktokVideo"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TiktokVideo_externalId_platform_key" ON "TiktokVideo"("externalId", "platform");
