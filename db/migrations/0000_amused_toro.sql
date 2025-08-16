CREATE TABLE IF NOT EXISTS "companies" (
	"companyid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bolagsverketid" text,
	"orgnumber" text,
	"serialnumber" text,
	"type" text,
	"name" text,
	"vatnumber" text,
	"email" text,
	"phone" text,
	"contactperson" text,
	"addressline1" text,
	"addressline2" text,
	"postalcode" text,
	"city" text,
	"fiscalyearstart" text,
	"fiscalyearend" text,
	"vatreportingperiod" text,
	"accountingmethod" text,
	"hasfirstannualreport" boolean DEFAULT false NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companyuserduties" (
	"companyuserdutyid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyuserid" uuid NOT NULL,
	"code" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companyusers" (
	"companyuserid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" uuid NOT NULL,
	"companyid" uuid NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"userid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"image" text,
	"password" text,
	"theme" text DEFAULT 'system',
	"language" text DEFAULT 'en',
	"permissions" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companyuserduties" ADD CONSTRAINT "companyuserduties_companyuserid_companyusers_companyuserid_fk" FOREIGN KEY ("companyuserid") REFERENCES "public"."companyusers"("companyuserid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companyusers" ADD CONSTRAINT "companyusers_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "companyusers" ADD CONSTRAINT "companyusers_companyid_companies_companyid_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
