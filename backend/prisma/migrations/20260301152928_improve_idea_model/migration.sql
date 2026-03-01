-- CreateEnum
CREATE TYPE "IdeaWho" AS ENUM ('Person', 'Team', 'Company', 'Customer', 'CoachExpert', 'Community', 'Event', 'Product');

-- CreateEnum
CREATE TYPE "IdeaWhat" AS ENUM ('Achievement', 'Announcement', 'Story', 'BehindTheScenes', 'Educational', 'Promotional', 'Community', 'Update', 'Testimonial', 'Entertainment');

-- CreateEnum
CREATE TYPE "IdeaWhy" AS ENUM ('BuildBrand', 'Inform', 'Engage', 'Attract', 'Retain', 'Prove', 'Inspire', 'Educate', 'Sell');

-- CreateEnum
CREATE TYPE "IdeaHow" AS ENUM ('Storytelling', 'ShortBlocks', 'NewsFormat', 'ListFormat', 'MinimalText', 'LongForm');

-- CreateEnum
CREATE TYPE "IdeaFeeling" AS ENUM ('Pride', 'Trust', 'Excitement', 'Inspiration', 'Joy', 'Belonging', 'Motivation', 'Curiosity', 'Anticipation', 'Authority', 'Empathy');

-- CreateEnum
CREATE TYPE "IdeaStatus" AS ENUM ('New', 'Planned', 'Used', 'Archived');

-- CreateTable
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "competitorId" TEXT NOT NULL,
    "competitorPostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "who" "IdeaWho" NOT NULL,
    "what" "IdeaWhat" NOT NULL,
    "why" "IdeaWhy" NOT NULL,
    "how" "IdeaHow" NOT NULL,
    "feeling" "IdeaFeeling" NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IdeaStatus" NOT NULL DEFAULT 'New',

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfileIdea" (
    "businessProfileId" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfileIdea_pkey" PRIMARY KEY ("businessProfileId","ideaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Idea_businessId_competitorPostId_competitorId_key" ON "Idea"("businessId", "competitorPostId", "competitorId");

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileIdea" ADD CONSTRAINT "BusinessProfileIdea_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileIdea" ADD CONSTRAINT "BusinessProfileIdea_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
