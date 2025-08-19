import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { companies } from "./company";

export const chats = pgTable("chats", {
  chatid: uuid("chatid").primaryKey().defaultRandom(),
  companyid: uuid("companyid")
    .notNull()
    .references(() => companies.companyid, { onDelete: "cascade" }),
  createdby: uuid("createdby")
    .notNull()
    .references(() => users.userid, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  isshared: boolean("isshared").default(false).notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
  lastmessageat: timestamp("lastmessageat").defaultNow().notNull(),
});

export const chatMessages = pgTable("chatmessages", {
  messageid: uuid("messageid").primaryKey().defaultRandom(),
  chatid: uuid("chatid")
    .notNull()
    .references(() => chats.chatid, { onDelete: "cascade" }),
  userid: uuid("userid").references(() => users.userid, {
    onDelete: "set null",
  }),
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  metadata: json("metadata"), // For storing AI model response metadata
  createdat: timestamp("createdat").defaultNow().notNull(),
});

// Junction table for chat sharing with specific users
export const chatUsers = pgTable("chatusers", {
  chatuserid: uuid("chatuserid").primaryKey().defaultRandom(),
  chatid: uuid("chatid")
    .notNull()
    .references(() => chats.chatid, { onDelete: "cascade" }),
  userid: uuid("userid")
    .notNull()
    .references(() => users.userid, { onDelete: "cascade" }),
  canwrite: boolean("canwrite").default(true).notNull(),
  createdat: timestamp("createdat").defaultNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type ChatUser = typeof chatUsers.$inferSelect;
export type NewChatUser = typeof chatUsers.$inferInsert;
