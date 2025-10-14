-- CreateEnum
CREATE TYPE "public"."BusinessIndustry" AS ENUM ('BeautyWellness', 'RetailEcommerce', 'FoodBeverage', 'ProfessionalServices', 'RealEstateConstruction');

-- CreateEnum
CREATE TYPE "public"."Tiers" AS ENUM ('Free', 'Basic', 'Premium');

-- CreateTable
CREATE TABLE "public"."Business" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "public"."BusinessIndustry" NOT NULL,
    "tier" "public"."Tiers" NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);
