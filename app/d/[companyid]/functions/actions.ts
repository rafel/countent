"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { companies, companyUsers, Company } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
