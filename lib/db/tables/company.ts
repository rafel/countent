import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./user";

export const companies = pgTable("companies", {
  companyid: uuid("companyid").primaryKey().defaultRandom(),
  bolagsverketid: text("bolagsverketid"),
  orgnumber: text("orgnumber"),
  serialnumber: text("serialnumber"),
  type: text("type"),
  name: text("name"),
  vatnumber: text("vatnumber"),
  email: text("email"),
  phone: text("phone"),
  contactperson: text("contactperson"),
  addressline1: text("addressline1"),
  addressline2: text("addressline2"),
  postalcode: text("postalcode"),
  city: text("city"),
  fiscalyearstart: text("fiscalyearstart"),
  fiscalyearend: text("fiscalyearend"),
  vatreportingperiod: text("vatreportingperiod"),
  accountingmethod: text("accountingmethod"),
  hasfirstannualreport: boolean("hasfirstannualreport")
    .default(false)
    .notNull(),
  createdat: timestamp("createdat").notNull().defaultNow(),
  updatedat: timestamp("updatedat").notNull().defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export const companyUsers = pgTable("companyusers", {
  companyuserid: uuid("companyuserid").primaryKey().defaultRandom(),
  userid: uuid("userid")
    .notNull()
    .references(() => users.userid, { onDelete: "cascade" }),
  companyid: uuid("companyid")
    .notNull()
    .references(() => companies.companyid, { onDelete: "cascade" }),
  role: text("role").default("owner").notNull(),
});

export type CompanyUser = typeof companyUsers.$inferSelect;
export type NewCompanyUser = typeof companyUsers.$inferInsert;

export const companyUserDuties = pgTable("companyuserduties", {
  companyuserdutyid: uuid("companyuserdutyid").primaryKey().defaultRandom(),
  companyuserid: uuid("companyuserid")
    .notNull()
    .references(() => companyUsers.companyuserid, { onDelete: "cascade" }),
  code: text("code"),
  name: text("name").notNull(),
});

export type CompanyUserDuty = typeof companyUserDuties.$inferSelect;
export type NewCompanyUserDuty = typeof companyUserDuties.$inferInsert;

// Company invitations table for pending invites
export const companyInvites = pgTable("companyinvites", {
  inviteid: uuid("inviteid").primaryKey().defaultRandom(),
  companyid: uuid("companyid")
    .notNull()
    .references(() => companies.companyid, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull(),
  invitedby: uuid("invitedby")
    .notNull()
    .references(() => users.userid, { onDelete: "cascade" }),
  createdat: timestamp("createdat").notNull().defaultNow(),
  expiresat: timestamp("expiresat"), // Optional expiration
});

export type CompanyInvite = typeof companyInvites.$inferSelect;
export type NewCompanyInvite = typeof companyInvites.$inferInsert;

// User company type for caching
export type UserCompany = {
  companyid: typeof companyUsers.$inferSelect.companyid;
  name: typeof companies.$inferSelect.name;
  role: typeof companyUsers.$inferSelect.role;
};
