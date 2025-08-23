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
	"stripecustomerid" text NOT NULL,
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
	"workspaceid" uuid NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"active" boolean DEFAULT true,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE IF NOT EXISTS "workspaceinvites" (
	"inviteid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspaceid" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'guest' NOT NULL,
	"invitedby" uuid NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"expiresat" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"workspaceid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'personal' NOT NULL,
	"description" text,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaceusers" (
	"workspaceid" uuid NOT NULL,
	"userid" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspaceusers_workspaceid_userid_pk" PRIMARY KEY("workspaceid","userid")
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
 ALTER TABLE "stripesubscriptions" ADD CONSTRAINT "stripe_sub_workspace_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usersessions" ADD CONSTRAINT "usersessions_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaceinvites" ADD CONSTRAINT "workspaceinvites_workspaceid_workspaces_workspaceid_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaceinvites" ADD CONSTRAINT "workspaceinvites_invitedby_users_userid_fk" FOREIGN KEY ("invitedby") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaceusers" ADD CONSTRAINT "workspaceuser_workspace_fk" FOREIGN KEY ("workspaceid") REFERENCES "public"."workspaces"("workspaceid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaceusers" ADD CONSTRAINT "workspaceuser_user_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
