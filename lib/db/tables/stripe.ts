import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  foreignKey,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { SubscriptionModels } from "@/content/common";

export type StripeMetadata = {
  user_id?: string;
  company_id?: string;
  model?: SubscriptionModels;
  subscriptionid?: string;
};

export type NewStripeMetadata = {
  user_id: string;
  company_id?: string;
  model: SubscriptionModels;
  subscriptionid: string;
};

export const stripecustomers = pgTable("stripecustomers", {
  stripecustomerid: text("stripecustomerid").primaryKey(),
  name: text("name"),
  email: text("email"),
  active: boolean("active").default(true),
  metadata: jsonb("metadata").default("{}").$type<StripeMetadata>(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type StripeCustomer = typeof stripecustomers.$inferSelect;
export type NewStripeCustomer = typeof stripecustomers.$inferInsert;

export const stripesubscriptions = pgTable(
  "stripesubscriptions",
  {
    stripesubscriptionid: text("stripesubscriptionid").primaryKey(),
    stripecustomerid: text("stripecustomerid"),
    stripecustomer: text("stripecustomer"),
    status: text("status"),
    plan: text("plan"),
    cancelatperiodend: boolean("cancelatperiodend"),
    currentperiodstart: timestamp("currentperiodstart"),
    currentperiodend: timestamp("currentperiodend"),
    endedat: timestamp("endedat"),
    cancelat: timestamp("cancelat"),
    canceledat: timestamp("canceledat"),
    trialstart: timestamp("trialstart"),
    trialend: timestamp("trialend"),
    amount: decimal("amount"),
    currency: text("currency"),
    interval: text("interval"),
    intervalcount: integer("intervalcount"),
    subscriptionid: text("subscriptionid"),
    userid: text("userid"),
    companyid: text("companyid"),
    metadata: jsonb("metadata").default("{}").$type<StripeMetadata>(),
    active: boolean("active").default(true),
    createdat: timestamp("createdat").defaultNow().notNull(),
    updatedat: timestamp("updatedat").defaultNow().notNull(),
  },
  (table) => {
    return {
      customerFk: foreignKey({
        columns: [table.stripecustomerid],
        foreignColumns: [stripecustomers.stripecustomerid],
        name: "stripe_sub_customer_fk",
      }),
    };
  }
);

export type StripeSubscription = typeof stripesubscriptions.$inferSelect;
export type NewStripeSubscription = typeof stripesubscriptions.$inferInsert;

export const stripeinvoices = pgTable(
  "stripeinvoices",
  {
    stripeinvoiceid: text("stripeinvoiceid").primaryKey(),
    stripecustomerid: text("stripecustomerid"),
    amountdue: decimal("amountdue"),
    amountpaid: decimal("amountpaid"),
    amountremaining: decimal("amountremaining"),
    billingreason: text("billingreason"),
    currency: text("currency"),
    hostedinvoiceurl: text("hostedinvoiceurl"),
    status: text("status"),
    active: boolean("active").default(true),
    createdat: timestamp("createdat").defaultNow().notNull(),
    updatedat: timestamp("updatedat").defaultNow().notNull(),
  },
  (table) => {
    return {
      customerFk: foreignKey({
        columns: [table.stripecustomerid],
        foreignColumns: [stripecustomers.stripecustomerid],
        name: "stripe_inv_customer_fk",
      }),
    };
  }
);

export type StripeInvoice = typeof stripeinvoices.$inferSelect;
export type NewStripeInvoice = typeof stripeinvoices.$inferInsert;

// Joined types for complex queries
export type StripeSubscriptionWithCustomer = {
  subscription: StripeSubscription;
  customer: StripeCustomer;
};
