-- CreateTable
CREATE TABLE "CalendarificHoliday" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "countryCode" TEXT NOT NULL,
    "holidays" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarificHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarificHoliday_year_countryCode_idx" ON "CalendarificHoliday"("year", "countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarificHoliday_year_countryCode_key" ON "CalendarificHoliday"("year", "countryCode");
