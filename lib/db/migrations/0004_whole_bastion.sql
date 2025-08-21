CREATE TABLE IF NOT EXISTS "subscriptioncompanies" (
	"subscriptionid" uuid NOT NULL,
	"companyid" uuid NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptioncompanies_subscriptionid_companyid_pk" PRIMARY KEY("subscriptionid","companyid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptioninfo" (
	"subscriptioninfoid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriptionid" uuid NOT NULL,
	"stripepriceid" text,
	"stripeproductid" text,
	"currentperiodstart" timestamp,
	"cancelatperiodend" boolean DEFAULT false,
	"canceledat" timestamp,
	"trialstart" timestamp,
	"trialend" timestamp,
	"amount" integer,
	"currency" text DEFAULT 'usd',
	"interval" text,
	"intervalcount" integer DEFAULT 1,
	"syncstrategy" text DEFAULT 'hybrid',
	"laststripesyncAt" timestamp,
	"metadata" jsonb,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptionpayers" (
	"subscriptionpayerid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payertype" text NOT NULL,
	"userid" uuid,
	"companyid" uuid,
	"stripecustomerid" text NOT NULL,
	"billingemail" text NOT NULL,
	"billingname" text,
	"vatnumber" text,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptionpayers_stripecustomerid_unique" UNIQUE("stripecustomerid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"subscriptionid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriptionpayerid" uuid NOT NULL,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"stripesubscriptionid" text,
	"currentperiodend" timestamp,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripesubscriptionid_unique" UNIQUE("stripesubscriptionid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptionusers" (
	"subscriptionid" uuid NOT NULL,
	"userid" uuid NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptionusers_subscriptionid_userid_pk" PRIMARY KEY("subscriptionid","userid")
);
--> statement-breakpoint
ALTER TABLE "streams" DROP CONSTRAINT "streams_streamid_pk";--> statement-breakpoint
ALTER TABLE "streams" ADD PRIMARY KEY ("streamid");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptioncompanies" ADD CONSTRAINT "subcomp_sub_fk" FOREIGN KEY ("subscriptionid") REFERENCES "public"."subscriptions"("subscriptionid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptioncompanies" ADD CONSTRAINT "subcomp_company_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptioninfo" ADD CONSTRAINT "subinfo_sub_fk" FOREIGN KEY ("subscriptionid") REFERENCES "public"."subscriptions"("subscriptionid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptionpayers" ADD CONSTRAINT "subscriptionpayers_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptionpayers" ADD CONSTRAINT "subscriptionpayers_companyid_companies_companyid_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptionpayers" ADD CONSTRAINT "payer_user_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptionpayers" ADD CONSTRAINT "payer_company_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subs_payer_fk" FOREIGN KEY ("subscriptionpayerid") REFERENCES "public"."subscriptionpayers"("subscriptionpayerid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptionusers" ADD CONSTRAINT "subuser_sub_fk" FOREIGN KEY ("subscriptionid") REFERENCES "public"."subscriptions"("subscriptionid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptionusers" ADD CONSTRAINT "subuser_user_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
