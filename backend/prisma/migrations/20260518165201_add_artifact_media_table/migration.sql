-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('Image', 'Video');

-- CreateTable
CREATE TABLE "AIArtifactMedia" (
    "id" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT,
    "jobId" TEXT,
    "sourceUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIArtifactMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIArtifactMedia" ADD CONSTRAINT "AIArtifactMedia_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "AIArtifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
