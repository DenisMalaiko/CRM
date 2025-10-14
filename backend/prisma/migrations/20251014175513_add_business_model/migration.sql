/*
  Warnings:

  - Changed the type of `tier` on the `Business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Business" DROP COLUMN "tier",
ADD COLUMN     "tier" TEXT NOT NULL;
