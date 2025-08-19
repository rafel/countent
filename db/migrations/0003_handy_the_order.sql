CREATE TABLE IF NOT EXISTS "chatmessages" (
	"messageid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatid" uuid NOT NULL,
	"userid" uuid,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" json,
	"createdat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatusers" (
	"chatuserid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatid" uuid NOT NULL,
	"userid" uuid NOT NULL,
	"canwrite" boolean DEFAULT true NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chats" (
	"chatid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyid" uuid NOT NULL,
	"createdby" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"isshared" boolean DEFAULT false NOT NULL,
	"createdat" timestamp DEFAULT now() NOT NULL,
	"updatedat" timestamp DEFAULT now() NOT NULL,
	"lastmessageat" timestamp DEFAULT now() NOT NULL
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
ALTER TABLE "users" ADD COLUMN "createdat" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updatedat" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatmessages" ADD CONSTRAINT "chatmessages_chatid_chats_chatid_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatmessages" ADD CONSTRAINT "chatmessages_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatusers" ADD CONSTRAINT "chatusers_chatid_chats_chatid_fk" FOREIGN KEY ("chatid") REFERENCES "public"."chats"("chatid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatusers" ADD CONSTRAINT "chatusers_userid_users_userid_fk" FOREIGN KEY ("userid") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_companyid_companies_companyid_fk" FOREIGN KEY ("companyid") REFERENCES "public"."companies"("companyid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chats" ADD CONSTRAINT "chats_createdby_users_userid_fk" FOREIGN KEY ("createdby") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;
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