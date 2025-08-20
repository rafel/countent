ALTER TABLE "documents" ADD COLUMN "kind" varchar DEFAULT 'sheet' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" DROP COLUMN IF EXISTS "text";