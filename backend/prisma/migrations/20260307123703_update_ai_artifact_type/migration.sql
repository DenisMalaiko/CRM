/*
  Warnings:

  - The values [Idea,Script,Angle] on the enum `AIArtifactType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AIArtifactType_new" AS ENUM ('Post', 'Story');
ALTER TABLE "AIArtifact" ALTER COLUMN "type" TYPE "AIArtifactType_new" USING ("type"::text::"AIArtifactType_new");
ALTER TYPE "AIArtifactType" RENAME TO "AIArtifactType_old";
ALTER TYPE "AIArtifactType_new" RENAME TO "AIArtifactType";
DROP TYPE "public"."AIArtifactType_old";
COMMIT;
