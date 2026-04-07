-- CreateTable
CREATE TABLE "IdeaAI" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "who" "IdeaWho" NOT NULL,
    "what" "IdeaWhat" NOT NULL,
    "why" "IdeaWhy" NOT NULL,
    "how" "IdeaHow" NOT NULL,
    "feeling" "IdeaFeeling" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "IdeaStatus" NOT NULL DEFAULT 'New',

    CONSTRAINT "IdeaAI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfileIdeaAI" (
    "businessProfileId" TEXT NOT NULL,
    "ideaAIId" TEXT NOT NULL,

    CONSTRAINT "BusinessProfileIdeaAI_pkey" PRIMARY KEY ("businessProfileId","ideaAIId")
);

-- AddForeignKey
ALTER TABLE "IdeaAI" ADD CONSTRAINT "IdeaAI_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileIdeaAI" ADD CONSTRAINT "BusinessProfileIdeaAI_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileIdeaAI" ADD CONSTRAINT "BusinessProfileIdeaAI_ideaAIId_fkey" FOREIGN KEY ("ideaAIId") REFERENCES "IdeaAI"("id") ON DELETE CASCADE ON UPDATE CASCADE;
