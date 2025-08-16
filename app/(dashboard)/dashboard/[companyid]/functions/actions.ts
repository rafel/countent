"use server";

import { cache } from "react";
import { dbclient } from "@/db/db";
import { companies, companyUsers, Company } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/utils/user";

export const getUserCompanies = cache(
  async (userId: string): Promise<Company[]> => {
    const user = await getUser();
    if (!user) {
      throw new Error("User not found");
    }

    const userCompanies = await dbclient
      .select()
      .from(companies)
      .innerJoin(companyUsers, eq(companies.companyid, companyUsers.companyid))
      .where(eq(companyUsers.userid, userId));

    return userCompanies.map((result) => result.companies);
  }
);
