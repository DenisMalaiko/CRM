-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('Free', 'Basic', 'Premium');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'Marketer', 'Worker');

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

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "positioning" TEXT NOT NULL,
    "toneOfVoice" TEXT NOT NULL,
    "brandRules" TEXT,
    "goals" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
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
    "embedding" vector(1536),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetAudience" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "ageRange" TEXT NOT NULL,
    "gender" TEXT,
    "geo" TEXT NOT NULL,
    "pains" TEXT[],
    "desires" TEXT[],
    "triggers" TEXT[],
    "incomeLevel" TEXT,

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

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "type" "TagType" NOT NULL,
    "value" TEXT NOT NULL,
    "normalizedValue" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfileTag" (
    "businessProfileId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BusinessProfileTag_pkey" PRIMARY KEY ("businessProfileId","tagId")
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
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessTrendMatch" (
    "businessProfileId" TEXT NOT NULL,
    "trendId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessTrendMatch_pkey" PRIMARY KEY ("businessProfileId","trendId")
);

-- CreateTable
CREATE TABLE "AIArtifact" (
    "id" TEXT NOT NULL,
    "type" "AIArtifactType" NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "productId" TEXT,
    "trendId" TEXT,
    "inputHash" TEXT NOT NULL,
    "outputJson" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "status" "AIArtifactStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "paramsSchema" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_code_key" ON "Platform"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TargetAudience" ADD CONSTRAINT "TargetAudience_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePlatform" ADD CONSTRAINT "BusinessProfilePlatform_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfilePlatform" ADD CONSTRAINT "BusinessProfilePlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTag" ADD CONSTRAINT "BusinessProfileTag_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileTag" ADD CONSTRAINT "BusinessProfileTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTrendMatch" ADD CONSTRAINT "BusinessTrendMatch_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessTrendMatch" ADD CONSTRAINT "BusinessTrendMatch_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifact" ADD CONSTRAINT "AIArtifact_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifact" ADD CONSTRAINT "AIArtifact_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIArtifact" ADD CONSTRAINT "AIArtifact_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
