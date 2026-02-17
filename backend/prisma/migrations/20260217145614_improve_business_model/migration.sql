-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "advantages" TEXT[] DEFAULT ARRAY['']::TEXT[],
ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "goals" TEXT[] DEFAULT ARRAY['']::TEXT[];
