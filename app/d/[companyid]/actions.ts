"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { companies, companyUsers, Company } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/utils/user";

export const getUserCompanies = cache(
  async (userId: string): Promise<Company[]> => {
    const user = await getUser();
    if (!user) {
      throw new Error("User not found");
    }

    const userCompanies = await db
      .select()
      .from(companies)
      .innerJoin(companyUsers, eq(companies.companyid, companyUsers.companyid))
      .where(eq(companyUsers.userid, userId));

    return userCompanies.map((result) => result.companies);
  }
);

export async function getCurrentUserCompanies(): Promise<{
  ownedCompanies: Array<{ companyid: string; name: string | null }>;
  error?: string;
}> {
  try {
    const user = await getUser();
    if (!user) {
      return { ownedCompanies: [], error: "User not authenticated" };
    }

    // Get companies where user is owner
    const ownedCompanies = await db
      .select({
        companyid: companies.companyid,
        name: companies.name,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyid, companies.companyid))
      .where(
        and(
          eq(companyUsers.userid, user.userid),
          eq(companyUsers.role, "owner")
        )
      );

    return { ownedCompanies };
  } catch (error) {
    console.error("Error fetching user companies:", error);
    return { ownedCompanies: [], error: "Failed to fetch companies" };
  }
}
