-- CreateEnum
CREATE TYPE "DesignSystemSource" AS ENUM ('MANUAL', 'AI_PHOTO', 'PRESET');

-- CreateTable
CREATE TABLE "DesignSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessId" TEXT,
    "source" "DesignSystemSource" NOT NULL DEFAULT 'PRESET',
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "colors" JSONB NOT NULL DEFAULT '{}',
    "gradients" JSONB NOT NULL DEFAULT '[]',
    "typography" JSONB NOT NULL DEFAULT '{}',
    "radius" TEXT NOT NULL DEFAULT '12px',
    "border" JSONB NOT NULL DEFAULT '{}',
    "shadow" JSONB NOT NULL DEFAULT '{}',
    "spacing" JSONB NOT NULL DEFAULT '{}',
    "brandElements" JSONB NOT NULL DEFAULT '{}',
    "composition" JSONB NOT NULL DEFAULT '{}',
    "scene" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DesignSystem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignSystem_businessId_idx" ON "DesignSystem"("businessId");

-- AddForeignKey
ALTER TABLE "DesignSystem" ADD CONSTRAINT "DesignSystem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
