-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('Free', 'Basic', 'Premium');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Marketer', 'Worker');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Invited', 'Disabled');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('Active', 'Paused', 'Archived');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('Product', 'Service');

-- CreateEnum
CREATE TYPE "PriceSegment" AS ENUM ('Low', 'Middle', 'Premium');

-- CreateEnum
CREATE TYPE "TagType" AS ENUM ('Niche', 'Hashtag', 'Pain', 'Format');

-- CreateEnum
CREATE TYPE "AIArtifactType" AS ENUM ('Idea', 'Post', 'Script', 'Angle');

-- CreateEnum
CREATE TYPE "AIArtifactStatus" AS ENUM ('Draft', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "PlatformList" AS ENUM ('Facebook', 'Instagram', 'Tiktok');

-- CreateEnum
CREATE TYPE "GalleryPhotoType" AS ENUM ('Image', 'Decoration');

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "industry" TEXT,
    "status" "BusinessStatus" NOT NULL,
    "advantages" TEXT[] DEFAULT ARRAY['']::TEXT[],
    "brand" TEXT NOT NULL DEFAULT '',
    "goals" TEXT[] DEFAULT ARRAY['']::TEXT[],

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileFocus" TEXT NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "priceSegment" "PriceSegment" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT[],
    "embedding" vector,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetAudience" (
    "id" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "gender" TEXT,
    "geo" TEXT NOT NULL,
    "pains" TEXT[],
    "desires" TEXT[],
    "triggers" TEXT[],
    "incomeLevel" TEXT,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interests" TEXT[],

    CONSTRAINT "TargetAudience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trendRefreshRate" INTEGER NOT NULL,
    "supportedFormats" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIArtifact" (
    "id" TEXT NOT NULL,
    "type" "AIArtifactType" NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "trendId" TEXT,
    "outputJson" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "status" "AIArtifactStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,
    "imagePrompt" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "AIArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facebookLink" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorPost" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "PlatformList" NOT NULL,
    "competitorId" TEXT NOT NULL,
    "text" TEXT,
    "url" TEXT,
    "media" JSONB,
    "likes" INTEGER,
    "shares" INTEGER,
    "postedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER,

    CONSTRAINT "CompetitorPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorAds" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "PlatformList" NOT NULL,
    "competitorId" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "caption" TEXT,
    "url" TEXT,
    "format" TEXT,
    "ctaText" TEXT,
    "ctaType" TEXT,
    "videos" JSONB,
    "images" JSONB,
    "start" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "active_days" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN,

    CONSTRAINT "CompetitorAds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "GalleryPhotoType" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "keywords" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "metrics" JSONB,
    "embedding" vector,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "type" "TagType" NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIArtifactProduct" (
    "aiArtifactId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "AIArtifactProduct_pkey" PRIMARY KEY ("aiArtifactId","productId")
);

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

-- CreateTable
CREATE TABLE "BusinessProfilePrompt" (
    "businessProfileId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfilePrompt_pkey" PRIMARY KEY ("businessProfileId","promptId")
);

-- CreateTable
CREATE TABLE "BusinessProfilePhoto" (
    "businessProfileId" TEXT NOT NULL,
    "galleryPhotoId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfilePhoto_pkey" PRIMARY KEY ("businessProfileId","galleryPhotoId")
);

-- CreateTable
CREATE TABLE "BusinessProfilePlatform" (
    "businessProfileId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "BusinessProfilePlatform_pkey" PRIMARY KEY ("businessProfileId","platformId")
);

-- CreateTable
CREATE TABLE "BusinessProfileTag" (
    "businessProfileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BusinessProfileTag_pkey" PRIMARY KEY ("businessProfileId","tagId")
);

-- CreateTable
CREATE TABLE "BusinessTrendMatch" (
    "businessProfileId" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessTrendMatch_pkey" PRIMARY KEY ("businessProfileId","trendId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_code_key" ON "Platform"("code");

-- CreateIndex
CREATE INDEX "AIArtifact_businessId_idx" ON "AIArtifact"("businessId");

-- CreateIndex
CREATE INDEX "CompetitorPost_competitorId_idx" ON "CompetitorPost"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorPost_platform_idx" ON "CompetitorPost"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorPost_externalId_platform_competitorId_key" ON "CompetitorPost"("externalId", "platform", "competitorId");

-- CreateIndex
CREATE INDEX "CompetitorAds_competitorId_idx" ON "CompetitorAds"("competitorId");

-- CreateIndex
CREATE INDEX "CompetitorAds_platform_idx" ON "CompetitorAds"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorAds_externalId_platform_competitorId_key" ON "CompetitorAds"("externalId", "platform", "competitorId");

-- CreateIndex
CREATE INDEX "BusinessProfilePhoto_galleryPhotoId_idx" ON "BusinessProfilePhoto"("galleryPhotoId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt" ADD CONSTRAINT "Prompt_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifact" ADD CONSTRAINT "AIArtifact_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifact" ADD CONSTRAINT "AIArtifact_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competitor" ADD CONSTRAINT "Competitor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorPost" ADD CONSTRAINT "CompetitorPost_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorAds" ADD CONSTRAINT "CompetitorAds_competitorId_fkey" FOREIGN KEY ("competitorId") REFERENCES "Competitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifactProduct" ADD CONSTRAINT "AIArtifactProduct_aiArtifactId_fkey" FOREIGN KEY ("aiArtifactId") REFERENCES "AIArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifactProduct" ADD CONSTRAINT "AIArtifactProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileProduct" ADD CONSTRAINT "BusinessProfileProduct_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileProduct" ADD CONSTRAINT "BusinessProfileProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTargetAudience" ADD CONSTRAINT "BusinessProfileTargetAudience_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTargetAudience" ADD CONSTRAINT "BusinessProfileTargetAudience_targetAudienceId_fkey" FOREIGN KEY ("targetAudienceId") REFERENCES "TargetAudience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePrompt" ADD CONSTRAINT "BusinessProfilePrompt_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePrompt" ADD CONSTRAINT "BusinessProfilePrompt_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePhoto" ADD CONSTRAINT "BusinessProfilePhoto_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePhoto" ADD CONSTRAINT "BusinessProfilePhoto_galleryPhotoId_fkey" FOREIGN KEY ("galleryPhotoId") REFERENCES "GalleryPhoto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

