import { db } from "@/lib/db";
import {
  NewCompany,
  companies,
  Company,
  companyUsers,
  NewCompanyUser,
  UserCompany,
  User,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createTeamSubscription } from "@/lib/db/queries/subscription";
import { commonSettings } from "@/content/common";

export async function createNewCompany(
  companyData: NewCompany,
  user: User
): Promise<Company | null> {
  try {
    const newCompanies = await db
      .insert(companies)
      .values(companyData)
      .returning();

    if (commonSettings.subscriptionModel === "b2b") {
      await createTeamSubscription(newCompanies[0].companyid, user.email);
    }
    const companyUserData: NewCompanyUser = {
      userid: user.userid,
      companyid: newCompanies[0].companyid,
      role: "owner",
    };

    await db.insert(companyUsers).values(companyUserData);

    return newCompanies[0] || null;
  } catch (error) {
    console.error("Error creating company:", error);
    return null;
  }
}

export async function getCompanyByID(
  companyID: string
): Promise<Company | null> {
  try {
    const dbCompanies = await db
      .select()
      .from(companies)
      .where(eq(companies.companyid, companyID))
      .limit(1);

    return dbCompanies[0] || null;
  } catch (error) {
    console.error("Error getting company by ID:", error);
    return null;
  }
}

export async function getUserCompanies(userId: string): Promise<UserCompany[]> {
  try {
    const userCompanies = await db
      .select({
        companyid: companies.companyid,
        name: companies.name,
        role: companyUsers.role,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyid, companies.companyid))
      .where(eq(companyUsers.userid, userId));

    return userCompanies;
  } catch (error) {
    console.error("Error getting user companies:", error);
    return [];
  }
}
