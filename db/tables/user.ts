import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userid: uuid("userid").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  image: text("image"),
  password: text("password"),
  theme: text("theme").default("system"),
  language: text("language").default("en"),
  permissions: text("permissions").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const userSessions = pgTable("usersessions", {
  sessionid: uuid("sessionid").primaryKey().defaultRandom(),
  userid: uuid("userid").notNull().references(() => users.userid, { onDelete: "cascade" }),
  session_token: text("session_token").notNull().unique(),
  device_info: text("device_info"),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  last_active: timestamp("last_active").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type UserPreferences = {
  theme?: string;
  language?: string;
};
