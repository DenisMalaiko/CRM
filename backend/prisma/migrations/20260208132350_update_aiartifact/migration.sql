-- DropForeignKey
ALTER TABLE "AIArtifact" DROP CONSTRAINT "AIArtifact_businessProfileId_fkey";

-- AddForeignKey
ALTER TABLE "AIArtifact" ADD CONSTRAINT "AIArtifact_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
