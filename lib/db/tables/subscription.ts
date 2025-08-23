import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { companies } from "./company";
import {
  SubscriptionModels,
  SubscriptionPlans as SubscriptionPlansType,
} from "@/content/common";
import { stripesubscriptions } from "./stripe";

export type SubscriptionPlans = SubscriptionPlansType;

export const subscriptions = pgTable("subscriptions", {
  subscriptionid: uuid("subscriptionid").primaryKey().defaultRandom(),
  plan: text("plan").notNull().$type<SubscriptionPlans>(),
  status: text("status").notNull(),
  model: text("model").notNull().$type<SubscriptionModels>(),
  stripesubscriptionid: text("stripesubscriptionid"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export const subscriptioncompanies = pgTable(
  "subscriptioncompanies",
  {
    subscriptionid: uuid("subscriptionid").notNull(),
    companyid: uuid("companyid").notNull(),
    createdat: timestamp("createdat").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.subscriptionid, table.companyid] }),
    subRef: foreignKey({
      columns: [table.subscriptionid],
      foreignColumns: [subscriptions.subscriptionid],
      name: "subcomp_sub_fk",
    }).onDelete("cascade"),
    companyRef: foreignKey({
      columns: [table.companyid],
      foreignColumns: [companies.companyid],
      name: "subcomp_company_fk",
    }).onDelete("cascade"),
  })
);

export type SubscriptionCompany = typeof subscriptioncompanies.$inferSelect;
export type NewSubscriptionCompany = typeof subscriptioncompanies.$inferInsert;

export const subscriptionusers = pgTable(
  "subscriptionusers",
  {
    subscriptionid: uuid("subscriptionid").notNull(),
    userid: uuid("userid").notNull(),
    createdat: timestamp("createdat").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.subscriptionid, table.userid] }),
    subRef: foreignKey({
      columns: [table.subscriptionid],
      foreignColumns: [subscriptions.subscriptionid],
      name: "subuser_sub_fk",
    }).onDelete("cascade"),
    userRef: foreignKey({
      columns: [table.userid],
      foreignColumns: [users.userid],
      name: "subuser_user_fk",
    }).onDelete("cascade"),
  })
);

export type SubscriptionUser = typeof subscriptionusers.$inferSelect;
export type NewSubscriptionUser = typeof subscriptionusers.$inferInsert;

export type SubscriptionAccess = {
  hasAccess: boolean;
  plan: SubscriptionPlans;
  hasBillingPage: boolean;
};
