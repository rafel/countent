CREATE TABLE IF NOT EXISTS "chats" (
	"chatid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	"userid" uuid NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "documents" (
	"documentid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"createdat" timestamp NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"text" varchar DEFAULT 'text' NOT NULL,
	"userid" uuid NOT NULL,
	CONSTRAINT "documents_documentid_createdat_pk" PRIMARY KEY("documentid","createdat")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatmessages" (
	"messageid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatid" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdat" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatstreams" (
	"streamid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatid" uuid NOT NULL,
	"createdat" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatsuggestions" (
	"suggestionid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"documentid" uuid NOT NULL,
	"documentcreatedat" timestamp NOT NULL,
	"originalText" text NOT NULL,
	"suggestedText" text NOT NULL,
	"description" text,
	"isResolved" boolean DEFAULT false NOT NULL,
	"userid" uuid NOT NULL,
	"createdat" timestamp NOT NULL,
	CONSTRAINT "chatsuggestions_suggestionid_pk" PRIMARY KEY("suggestionid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatvotes" (
	"chatid" uuid NOT NULL,
	"messageid" uuid NOT NULL,
	"isupvoted" boolean NOT NULL,
	CONSTRAINT "chatvotes_chatid_messageid_pk" PRIMARY KEY("chatid","messageid")
);
--> statement-breakpoint
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
	"role" text DEFAULT 'owner' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripecustomers" (
	"stripecustomerid" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"active" boolean DEFAULT true,
	"metadata" jsonb DEFAULT '{}',
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripeinvoices" (
	"stripeinvoiceid" text PRIMARY KEY NOT NULL,
	"stripecustomerid" text,
	"amountdue" numeric,
	"amountpaid" numeric,
	"amountremaining" numeric,
	"billingreason" text,
	"currency" text,
	"hostedinvoiceurl" text,
	"status" text,
	"active" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripesubscriptions" (
	"stripesubscriptionid" text PRIMARY KEY NOT NULL,
	"stripecustomerid" text,
	"stripecustomer" text,
	"status" text,
	"plan" text,
	"cancelatperiodend" boolean,
	"currentperiodstart" timestamp,
	"currentperiodend" timestamp,
	"endedat" timestamp,
	"cancelat" timestamp,
	"canceledat" timestamp,
	"trialstart" timestamp,
	"trialend" timestamp,
	"amount" numeric,
	"currency" text,
	"interval" text,
	"intervalcount" integer,
	"subscriptionid" text,
	"userid" text,
	"companyid" text,
	"metadata" jsonb DEFAULT '{}',
	"active" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptioncompanies" (
	"subscriptionid" uuid NOT NULL,
	"companyid" uuid NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptioncompanies_subscriptionid_companyid_pk" PRIMARY KEY("subscriptionid","companyid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"subscriptionid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"model" text NOT NULL,
	"stripesubscriptionid" text,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptionusers" (
	"subscriptionid" uuid NOT NULL,
	"userid" uuid NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptionusers_subscriptionid_userid_pk" PRIMARY KEY("subscriptionid","userid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usersessions" (
	"sessionid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userid" uuid NOT NULL,
	"sessiontoken" text NOT NULL,
	"deviceinfo" text,
	"ipaddress" text,
	"useragent" text,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"lastactive" timestamp DEFAULT now() NOT NULL,
	"expiresat" timestamp NOT NULL,
	CONSTRAINT "usersessions_sessiontoken_unique" UNIQUE("sessiontoken")
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
	"type" text DEFAULT 'regular' NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "documents" ADD CONSTRAINT "documents_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatmessages" ADD CONSTRAINT "chatmessages_chatid_chats_chatid_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatstreams" ADD CONSTRAINT "streams_chat_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatsuggestions" ADD CONSTRAINT "chatsuggestions_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatsuggestions" ADD CONSTRAINT "suggestions_document_fk" FOREIGN KEY ("documentid","documentcreatedat") REFERENCES "public"."documents"("documentid","createdat") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatvotes" ADD CONSTRAINT "chatvotes_chatid_chats_chatid_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatvotes" ADD CONSTRAINT "chatvotes_messageid_chatmessages_messageid_fk" FOREIGN KEY ("messageid") REFERENCES "public"."chatmessages"("messageid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stripeinvoices" ADD CONSTRAINT "stripe_inv_customer_fk" FOREIGN KEY ("stripecustomerid") REFERENCES "public"."stripecustomers"("stripecustomerid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stripesubscriptions" ADD CONSTRAINT "stripe_sub_customer_fk" FOREIGN KEY ("stripecustomerid") REFERENCES "public"."stripecustomers"("stripecustomerid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usersessions" ADD CONSTRAINT "usersessions_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
