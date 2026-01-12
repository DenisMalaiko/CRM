/*
  Warnings:

  - Added the required column `name` to the `TargetAudience` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TargetAudience" ADD COLUMN     "name" TEXT NOT NULL;
