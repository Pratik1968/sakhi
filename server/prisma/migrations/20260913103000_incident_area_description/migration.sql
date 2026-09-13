-- Replace the single `note` field on Incident with structured `area` + `description`.

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "area" TEXT;
ALTER TABLE "Incident" ADD COLUMN "description" TEXT;

-- Preserve any existing note text as the description before dropping the column.
UPDATE "Incident" SET "description" = "note" WHERE "note" IS NOT NULL;

ALTER TABLE "Incident" DROP COLUMN "note";
