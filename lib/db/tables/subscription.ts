import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { users } from "./user";
import { companies } from "./company";
import { SubscriptionPlans as SubscriptionPlansType } from "@/content/common";

export type SubscriptionPlans = SubscriptionPlansType;

export const subscriptionpayers = pgTable(
  "subscriptionpayers",
  {
    subscriptionpayerid: uuid("subscriptionpayerid")
      .primaryKey()
      .defaultRandom(),

    // What type of payer this is
    payertype: text("payertype").notNull().$type<"user" | "company">(),

    // Reference to the actual entity (user OR company)
    userid: uuid("userid").references(() => users.userid), // NULL if payertype = "company"
    companyid: uuid("companyid").references(() => companies.companyid), // NULL if payertype = "user"

    // Stripe integration
    stripecustomerid: text("stripecustomerid").unique(),

    // Billing contact info (can be different from user/company)
    billingemail: text("billingemail").notNull(),
    billingname: text("billingname"),
    vatnumber: text("vatnumber"),

    // Metadata
    createdat: timestamp("createdat").defaultNow().notNull(),
    updatedat: timestamp("updatedat").defaultNow().notNull(),
  },
  (table) => ({
    userRef: foreignKey({
      columns: [table.userid],
      foreignColumns: [users.userid],
      name: "payer_user_fk",
    }).onDelete("cascade"), // If user deleted, payer deleted
    companyRef: foreignKey({
      columns: [table.companyid],
      foreignColumns: [companies.companyid],
      name: "payer_company_fk",
    }).onDelete("cascade"), // If company deleted, payer deleted
  })
);

export type SubscriptionPayer = typeof subscriptionpayers.$inferSelect;
export type NewSubscriptionPayer = typeof subscriptionpayers.$inferInsert;

export const subscriptions = pgTable(
  "subscriptions",
  {
    subscriptionid: uuid("subscriptionid").primaryKey().defaultRandom(),

    // Who pays the bill (references subscriptionpayers)
    subscriptionpayerid: uuid("subscriptionpayerid").notNull(),

    plan: text("plan").notNull().$type<SubscriptionPlans>(),
    status: text("status").notNull(),
    stripesubscriptionid: text("stripesubscriptionid").unique(),
    currentperiodend: timestamp("currentperiodend"),
    cancelat: timestamp("cancelat"),
    canceledat: timestamp("canceledat"),
    createdat: timestamp("createdat").defaultNow().notNull(),
    updatedat: timestamp("updatedat").defaultNow().notNull(),
  },
  (table) => ({
    payerRef: foreignKey({
      columns: [table.subscriptionpayerid],
      foreignColumns: [subscriptionpayers.subscriptionpayerid],
      name: "subs_payer_fk",
    }).onDelete("cascade"),
  })
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

// Many-to-many: Which companies are covered by this subscription
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

// Many-to-many: Which users have access to this subscription
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

export const subscriptioninfo = pgTable(
  "subscriptioninfo",
  {
    subscriptioninfoid: uuid("subscriptioninfoid").primaryKey().defaultRandom(),
    subscriptionid: uuid("subscriptionid").notNull(),

    stripepriceid: text("stripepriceid"),
    stripeproductid: text("stripeproductid"),
    currentperiodstart: timestamp("currentperiodstart"),
    cancelatperiodend: boolean("cancelatperiodend").default(false),
    canceledat: timestamp("canceledat"),
    trialstart: timestamp("trialstart"),
    trialend: timestamp("trialend"),
    amount: integer("amount"),
    currency: text("currency").default("usd"),
    interval: text("interval"),
    intervalcount: integer("intervalcount").default(1),
    syncstrategy: text("syncstrategy").default("hybrid"),
    laststripesyncAt: timestamp("laststripesyncAt"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdat: timestamp("createdat").defaultNow().notNull(),
    updatedat: timestamp("updatedat").defaultNow().notNull(),
  },
  (table) => ({
    subRef: foreignKey({
      columns: [table.subscriptionid],
      foreignColumns: [subscriptions.subscriptionid],
      name: "subinfo_sub_fk",
    }).onDelete("cascade"),
  })
);

export type SubscriptionInfo = typeof subscriptioninfo.$inferSelect;
export type NewSubscriptionInfo = typeof subscriptioninfo.$inferInsert;

export type SubscriptionAccess = {
  hasAccess: boolean;
  plan: SubscriptionPlans;
  hasBillingPage: boolean;
}
