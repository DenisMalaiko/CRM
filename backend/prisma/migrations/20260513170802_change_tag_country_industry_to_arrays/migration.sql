/*
  Warnings:

  - You are about to drop the column `country` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "country",
DROP COLUMN "industry",
ADD COLUMN     "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "industries" TEXT[] DEFAULT ARRAY[]::TEXT[];
