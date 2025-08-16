import { cache } from "react";
import { dbclient } from "@/db/db";
import { companies, companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "./user";

export const getUserCompanies = cache(async (userId: string) => {
  const user = await getUser();
  if (!user) {
    throw new Error("User not found");
  }
  const userCompanies = await dbclient
    .select({
      companyid: companies.companyid,
      name: companies.name,
      role: companyUsers.role,
    })
    .from(companyUsers)
    .innerJoin(companies, eq(companyUsers.companyid, companies.companyid))
    .where(eq(companyUsers.userid, userId));

  return userCompanies;
});
