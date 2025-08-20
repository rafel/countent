CREATE TABLE IF NOT EXISTS "chats" (
	"chatid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdat" timestamp NOT NULL,
	"title" text NOT NULL,
	"userid" uuid NOT NULL,
	"companyid" uuid NOT NULL,
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
CREATE TABLE IF NOT EXISTS "messages" (
	"messageid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatid" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdat" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "streams" (
	"streamid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chatid" uuid NOT NULL,
	"createdat" timestamp NOT NULL,
	CONSTRAINT "streams_streamid_pk" PRIMARY KEY("streamid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "suggestions" (
	"suggestionid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"documentid" uuid NOT NULL,
	"documentcreatedat" timestamp NOT NULL,
	"originaltext" text NOT NULL,
	"suggestedtext" text NOT NULL,
	"description" text,
	"isresolved" boolean DEFAULT false NOT NULL,
	"userid" uuid NOT NULL,
	"createdat" timestamp NOT NULL,
	CONSTRAINT "suggestions_suggestionid_pk" PRIMARY KEY("suggestionid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "votes" (
	"chatid" uuid NOT NULL,
	"messageid" uuid NOT NULL,
	"isupvoted" boolean NOT NULL,
	CONSTRAINT "votes_chatid_messageid_pk" PRIMARY KEY("chatid","messageid")
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
DROP TABLE "user_sessions";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "type" text DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "createdat" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updatedat" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_companyid_companies_companyid_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "messages" ADD CONSTRAINT "messages_chatid_chats_chatid_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "streams" ADD CONSTRAINT "streams_chat_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_document_fk" FOREIGN KEY ("documentid","documentcreatedat") REFERENCES "public"."documents"("documentid","createdat") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_chatid_chats_chatid_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "votes" ADD CONSTRAINT "votes_messageid_messages_messageid_fk" FOREIGN KEY ("messageid") REFERENCES "public"."messages"("messageid") ON DELETE no action ON UPDATE no action;
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
ALTER TABLE "users" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "updated_at";