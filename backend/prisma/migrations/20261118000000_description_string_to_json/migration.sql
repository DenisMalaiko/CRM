-- GalleryPhoto: convert description from TEXT to JSONB
UPDATE "GalleryPhoto"
SET "description" = CASE
  WHEN "description" IS NULL THEN NULL
  WHEN "description" = '' THEN '{}'
  ELSE json_build_object('en', "description")::text
END;

ALTER TABLE "GalleryPhoto" ALTER COLUMN "description" TYPE JSONB USING "description"::jsonb;

-- GalleryPhotoHistory: convert description from TEXT to JSONB
UPDATE "GalleryPhotoHistory"
SET "description" = CASE
  WHEN "description" IS NULL THEN NULL
  WHEN "description" = '' THEN '{}'
  ELSE json_build_object('en', "description")::text
END;

ALTER TABLE "GalleryPhotoHistory" ALTER COLUMN "description" TYPE JSONB USING "description"::jsonb;

-- DefaultPhoto: convert description from TEXT to JSONB
UPDATE "DefaultPhoto"
SET "description" = CASE
  WHEN "description" IS NULL THEN NULL
  WHEN "description" = '' THEN '{}'
  ELSE json_build_object('en', "description")::text
END;

ALTER TABLE "DefaultPhoto" ALTER COLUMN "description" TYPE JSONB USING "description"::jsonb;
