import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  varchar,
  json,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { companies } from "./company";

export const chat = pgTable("chats", {
  chatid: uuid("chatid").primaryKey().notNull().defaultRandom(),
  createdat: timestamp("createdat").notNull(),
  title: text("title").notNull(),
  userid: uuid("userid")
    .notNull()
    .references(() => users.userid),
  companyid: uuid("companyid")
    .notNull()
    .references(() => companies.companyid),
  visibility: varchar("visibility", { enum: ["shared", "private"] })
    .notNull()
    .default("private"),
});

export type Chat = typeof chat.$inferSelect;
export type NewChat = typeof chat.$inferInsert;

export const message = pgTable("messages", {
  messageid: uuid("messageid").primaryKey().notNull().defaultRandom(),
  chatid: uuid("chatid")
    .notNull()
    .references(() => chat.chatid),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdat: timestamp("createdat").notNull(),
});

export type DBMessage = typeof message.$inferSelect;
export type NewDBMessage = typeof message.$inferInsert;

export const vote = pgTable(
  "votes",
  {
    chatid: uuid("chatid")
      .notNull()
      .references(() => chat.chatid),
    messageid: uuid("messageid")
      .notNull()
      .references(() => message.messageid),
    isupvoted: boolean("isupvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatid, table.messageid] }),
    };
  }
);

export type Vote = typeof vote.$inferSelect;
export type NewVote = typeof vote.$inferInsert;

export const document = pgTable(
  "documents",
  {
    documentid: uuid("documentid").notNull().defaultRandom(),
    createdat: timestamp("createdat").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("kind", { enum: ["image", "sheet"] })
      .notNull()
      .default("sheet"),
    userid: uuid("userid")
      .notNull()
      .references(() => users.userid),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.documentid, table.createdat] }),
    };
  }
);

export type Document = typeof document.$inferSelect;
export type NewDocument = typeof document.$inferInsert;

export const suggestion = pgTable(
  "suggestions",
  {
    suggestionid: uuid("suggestionid").notNull().defaultRandom(),
    documentid: uuid("documentid").notNull(),
    documentcreatedat: timestamp("documentcreatedat").notNull(),
    originaltext: text("originaltext").notNull(),
    suggestedtext: text("suggestedtext").notNull(),
    description: text("description"),
    isresolved: boolean("isresolved").notNull().default(false),
    userid: uuid("userid")
      .notNull()
      .references(() => users.userid),
    createdat: timestamp("createdat").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.suggestionid] }),
    documentRef: foreignKey({
      columns: [table.documentid, table.documentcreatedat],
      foreignColumns: [document.documentid, document.createdat],
      name: "suggestions_document_fk",
    }),
  })
);

export type Suggestion = typeof suggestion.$inferSelect;
export type NewSuggestion = typeof suggestion.$inferInsert;

export const stream = pgTable(
  "streams",
  {
    streamid: uuid("streamid").notNull().defaultRandom(),
    chatid: uuid("chatid").notNull(),
    createdat: timestamp("createdat").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.streamid] }),
    chatRef: foreignKey({
      columns: [table.chatid],
      foreignColumns: [chat.chatid],
      name: "streams_chat_fk",
    }),
  })
);

export type Stream = typeof stream.$inferSelect;
export type NewStream = typeof stream.$inferInsert;
