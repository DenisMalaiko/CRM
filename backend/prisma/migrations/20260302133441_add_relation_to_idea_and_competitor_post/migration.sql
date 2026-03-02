-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_competitorPostId_fkey" FOREIGN KEY ("competitorPostId") REFERENCES "CompetitorPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
