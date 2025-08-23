import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  foreignKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { User, users } from "./user";
import { StripeSubscription } from "./stripe";

export type WorkspaceType = "personal" | "company";
export type WorkspaceUserRole = "owner" | "admin" | "member" | "guest";

export interface WorkspaceSettings {
  icon?: string;
  [key: string]: unknown; // Allow for future settings
}

export const workspaces = pgTable("workspaces", {
  workspaceid: uuid("workspaceid").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type")
    .notNull()
    .$type<WorkspaceType>()
    .default("personal" as WorkspaceType),
  description: text("description"),
  settings: jsonb("settings").default("{}").$type<WorkspaceSettings>(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export const workspaceusers = pgTable(
  "workspaceusers",
  {
    workspaceid: uuid("workspaceid").notNull(),
    userid: uuid("userid").notNull(),
    role: text("role")
      .notNull()
      .$type<WorkspaceUserRole>()
      .default("member" as WorkspaceUserRole),
    createdat: timestamp("createdat").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.workspaceid, table.userid] }),
    workspaceRef: foreignKey({
      columns: [table.workspaceid],
      foreignColumns: [workspaces.workspaceid],
      name: "workspaceuser_workspace_fk",
    }).onDelete("cascade"),
    userRef: foreignKey({
      columns: [table.userid],
      foreignColumns: [users.userid],
      name: "workspaceuser_user_fk",
    }).onDelete("cascade"),
  })
);

export type WorkspaceUser = typeof workspaceusers.$inferSelect;
export type NewWorkspaceUser = typeof workspaceusers.$inferInsert;

export type WorkspaceWithUsers = {
  workspace: Workspace;
  users: (WorkspaceUser & { user: typeof users.$inferSelect })[];
};

export const workspaceinvites = pgTable("workspaceinvites", {
  inviteid: uuid("inviteid").primaryKey().defaultRandom(),
  workspaceid: uuid("workspaceid")
    .notNull()
    .references(() => workspaces.workspaceid, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role")
    .notNull()
    .$type<WorkspaceUserRole>()
    .default("guest" as WorkspaceUserRole),
  invitedby: uuid("invitedby")
    .notNull()
    .references(() => users.userid, { onDelete: "cascade" }),
  createdat: timestamp("createdat").notNull().defaultNow(),
  expiresat: timestamp("expiresat"), // Optional expiration
});

export type WorkspaceInvite = typeof workspaceinvites.$inferSelect;
export type NewWorkspaceInvite = typeof workspaceinvites.$inferInsert;

export type UserWorkspace = {
  workspace: Workspace;
  role: WorkspaceUserRole;
};

export type WorkspaceInviteWithWorkspaceAndInviter = WorkspaceInvite & {
  workspace: Workspace;
  inviter: User;
};

export type WorkspaceWithStripeSubscription =
  | (Workspace & { role: WorkspaceUserRole } & {
      stripeSubscription: StripeSubscription | null;
    })
  | null;
