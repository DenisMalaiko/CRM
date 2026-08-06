-- CreateTable
CREATE TABLE "PublicHoliday" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "holidays" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicHoliday_year_countryCode_idx" ON "PublicHoliday"("year", "countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "PublicHoliday_year_countryCode_key" ON "PublicHoliday"("year", "countryCode");
