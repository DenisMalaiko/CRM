/*
  Warnings:

  - Added the required column `businessId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "businessId" TEXT NOT NULL;
