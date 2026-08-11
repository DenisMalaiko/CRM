-- CreateTable
CREATE TABLE "FacebookReport" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "posts" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstagramReport" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "posts" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstagramReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookReport_businessId_key" ON "FacebookReport"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "InstagramReport_businessId_key" ON "InstagramReport"("businessId");

-- AddForeignKey
ALTER TABLE "FacebookReport" ADD CONSTRAINT "FacebookReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstagramReport" ADD CONSTRAINT "InstagramReport_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
