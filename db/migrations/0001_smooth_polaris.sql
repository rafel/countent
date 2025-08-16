CREATE TABLE IF NOT EXISTS "companyinvites" (
	"inviteid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyid" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"invitedby" uuid NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"expiresat" timestamp
);
--> statement-breakpoint
ALTER TABLE "companyusers" ALTER COLUMN "role" SET DEFAULT 'owner';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companyinvites" ADD CONSTRAINT "companyinvites_companyid_companies_companyid_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companyinvites" ADD CONSTRAINT "companyinvites_invitedby_users_userid_fk" FOREIGN KEY ("invitedby") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
