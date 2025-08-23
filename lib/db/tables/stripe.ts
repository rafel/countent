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
import { workspaces } from "./workspace";

export type StripeMetadata = {
  workspaceid: typeof workspaces.$inferSelect.workspaceid;
};

export const stripecustomers = pgTable("stripecustomers", {
  stripecustomerid: text("stripecustomerid").primaryKey().notNull(),
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
    stripesubscriptionid: text("stripesubscriptionid").primaryKey().notNull(),
    stripecustomerid: text("stripecustomerid").notNull(),
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
    workspaceid: uuid("workspaceid").notNull(),
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
      }).onDelete("no action"), // A subscription can have days left but no customer
      workspaceFk: foreignKey({
        columns: [table.workspaceid],
        foreignColumns: [workspaces.workspaceid],
        name: "stripe_sub_workspace_fk",
      }),
    };
  }
);

export type StripeSubscription = typeof stripesubscriptions.$inferSelect;
export type NewStripeSubscription = typeof stripesubscriptions.$inferInsert;

export const stripeinvoices = pgTable(
  "stripeinvoices",
  {
    stripeinvoiceid: text("stripeinvoiceid").primaryKey().notNull(),
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
      }).onDelete("no action"),
    };
  }
);

export type StripeInvoice = typeof stripeinvoices.$inferSelect;
export type NewStripeInvoice = typeof stripeinvoices.$inferInsert;
