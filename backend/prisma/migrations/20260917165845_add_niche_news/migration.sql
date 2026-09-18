-- CreateTable
CREATE TABLE "NicheNews" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NicheNews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NicheNews_url_key" ON "NicheNews"("url");

-- CreateIndex
CREATE INDEX "NicheNews_agencyId_industry_idx" ON "NicheNews"("agencyId", "industry");

-- AddForeignKey
ALTER TABLE "NicheNews" ADD CONSTRAINT "NicheNews_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
