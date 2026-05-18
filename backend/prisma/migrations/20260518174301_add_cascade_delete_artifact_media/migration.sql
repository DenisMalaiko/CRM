-- DropForeignKey
ALTER TABLE "AIArtifactMedia" DROP CONSTRAINT "AIArtifactMedia_artifactId_fkey";

-- AddForeignKey
ALTER TABLE "AIArtifactMedia" ADD CONSTRAINT "AIArtifactMedia_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "AIArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
