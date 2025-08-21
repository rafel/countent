import {
  pgTable,
  uuid,
  timestamp,
  text,
  varchar,
  json,
  boolean,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { InferSelectModel } from "drizzle-orm";

export type VisibilityType = "public" | "private" | "company";

export const chat = pgTable("chats", {
  id: uuid("chatid").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdat").notNull(),
  title: text("title").notNull(),
  userId: uuid("userid")
    .notNull()
    .references(() => users.userid),
  visibility: varchar("visibility", { enum: ["public", "private", "company"] })
    .$type<VisibilityType>()
    .notNull()
    .default("private"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("messages", {
  id: uuid("messageid").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatid")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdat").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "votes",
  {
    chatId: uuid("chatid")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageid")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isupvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "documents",
  {
    id: uuid("documentid").notNull().defaultRandom(),
    createdAt: timestamp("createdat").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userid")
      .notNull()
      .references(() => users.userid),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "suggestions",
  {
    id: uuid("suggestionid").notNull().defaultRandom(),
    documentId: uuid("documentid").notNull(),
    documentCreatedAt: timestamp("documentcreatedat").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userid")
      .notNull()
      .references(() => users.userid),
    createdAt: timestamp("createdat").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
      name: "suggestions_document_fk",
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "streams",
  {
    id: uuid("streamid").primaryKey().notNull().defaultRandom(),
    chatId: uuid("chatid").notNull(),
    createdAt: timestamp("createdat").notNull(),
  },
  (table) => ({
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
      name: "streams_chat_fk",
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;
