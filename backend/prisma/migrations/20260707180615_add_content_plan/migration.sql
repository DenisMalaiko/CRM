-- CreateEnum
CREATE TYPE "ContentPlanStatus" AS ENUM ('Draft', 'Active', 'Completed', 'Archived');

-- CreateEnum
CREATE TYPE "ContentPlanMode" AS ENUM ('manual', 'profile');

-- CreateTable
CREATE TABLE "ContentPlan" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "ContentPlanStatus" NOT NULL DEFAULT 'Draft',
    "mode" "ContentPlanMode" NOT NULL,
    "postsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentPlan_businessId_idx" ON "ContentPlan"("businessId");

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
