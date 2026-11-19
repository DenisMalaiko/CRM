-- AlterTable
ALTER TABLE "ContentPlan" ADD COLUMN "designSystemId" TEXT;

-- CreateIndex
CREATE INDEX "ContentPlan_designSystemId_idx" ON "ContentPlan"("designSystemId");

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_designSystemId_fkey" FOREIGN KEY ("designSystemId") REFERENCES "DesignSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
