import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  decimal,
  boolean,
  foreignKey,
} from "drizzle-orm/pg-core";

export const stripecustomers = pgTable("stripecustomers", {
  stripecustomerid: varchar("stripecustomerid").primaryKey(),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type StripeCustomer = typeof stripecustomers.$inferSelect;
export type NewStripeCustomer = typeof stripecustomers.$inferInsert;

export const stripeproducts = pgTable("stripeproducts", {
  stripeproductid: varchar("stripeproductid").primaryKey(),
  active: boolean("active"),
  name: text("name"),
  description: text("description"),
  image: text("image"),
  metadata: text("metadata"), // Storing JSON as text, to be parsed in application
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type StripeProduct = typeof stripeproducts.$inferSelect;
export type NewStripeProduct = typeof stripeproducts.$inferInsert;

export const stripeprices = pgTable("stripeprices", {
  stripepriceid: varchar("stripepriceid").primaryKey(),
  stripeproductid: varchar("stripeproductid").references(
    () => stripeproducts.stripeproductid
  ),
  active: boolean("active"),
  currency: text("currency"),
  description: text("description"),
  type: text("type"), // one_time or recurring
  unitamount: decimal("unitamount"),
  interval: text("interval"), // day, week, month or year
  intervalcount: integer("intervalcount"),
  trialperioddays: integer("trialperioddays"),
  metadata: text("metadata"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type StripePrice = typeof stripeprices.$inferSelect;
export type NewStripePrice = typeof stripeprices.$inferInsert;

export const stripesubscriptions = pgTable("stripesubscriptions", {
  stripesubscriptionid: varchar("stripesubscriptionid").primaryKey(),
  stripecustomerid: varchar("stripecustomerid"),
  status: text("status"),
  stripepriceid: varchar("stripepriceid").references(
    () => stripeprices.stripepriceid
  ),
  quantity: integer("quantity"),
  cancelatperiodend: boolean("cancelatperiodend"),
  currentperiodstart: timestamp("currentperiodstart"),
  currentperiodend: timestamp("currentperiodend"),
  endedat: timestamp("endedat"),
  cancelat: timestamp("cancelat"),
  canceledat: timestamp("canceledat"),
  trialstart: timestamp("trialstart"),
  trialend: timestamp("trialend"),
  metadata: text("metadata"),
  createdat: timestamp("createdat").defaultNow().notNull(),
  updatedat: timestamp("updatedat").defaultNow().notNull(),
});

export type StripeSubscription = typeof stripesubscriptions.$inferSelect;
export type NewStripeSubscription = typeof stripesubscriptions.$inferInsert;

export const stripeinvoices = pgTable(
  "stripeinvoices",
  {
    stripeinvoiceid: varchar("stripeinvoiceid").primaryKey(),
    stripesubscriptionid: varchar("stripesubscriptionid"),
    stripecustomerid: varchar("stripecustomerid"),
    amountdue: decimal("amountdue"),
    amountpaid: decimal("amountpaid"),
    amountremaining: decimal("amountremaining"),
    billingreason: text("billingreason"),
    currency: text("currency"),
    hostedinvoiceurl: text("hostedinvoiceurl"),
    status: text("status"),
    createdat: timestamp("createdat").defaultNow().notNull(),
    updatedat: timestamp("updatedat").defaultNow().notNull(),
  },
  (table) => {
    return {
      subscriptionFk: foreignKey({
        columns: [table.stripesubscriptionid],
        foreignColumns: [stripesubscriptions.stripesubscriptionid],
      }),
      customerFk: foreignKey({
        columns: [table.stripecustomerid],
        foreignColumns: [stripecustomers.stripecustomerid],
      }),
    };
  }
);

export type StripeInvoice = typeof stripeinvoices.$inferSelect;
export type NewStripeInvoice = typeof stripeinvoices.$inferInsert;
