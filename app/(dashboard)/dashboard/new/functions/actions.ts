"use server";

import { dbclient } from "@/db/db";
import {
  companies,
  companyUsers,
  NewCompany,
  NewCompanyUser,
} from "@/db/tables/company";
import { eq } from "drizzle-orm";
import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";

export async function createCompanyAction(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const companyData: NewCompany = {
      name: formData.get("name") as string,
      orgnumber: formData.get("orgnumber") as string || null,
      bolagsverketid: null, // Removed field
      serialnumber: null, // Removed field
      type: formData.get("type") as string || null,
      vatnumber: formData.get("vatnumber") as string || null,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      contactperson: formData.get("contactperson") as string || null,
      addressline1: formData.get("addressline1") as string || null,
      addressline2: formData.get("addressline2") as string || null,
      postalcode: formData.get("postalcode") as string || null,
      city: formData.get("city") as string || null,
      fiscalyearstart: formData.get("fiscalyearstart") as string || null,
      fiscalyearend: formData.get("fiscalyearend") as string || null,
      vatreportingperiod: formData.get("vatreportingperiod") as string || null,
      accountingmethod: formData.get("accountingmethod") as string || null,
      hasfirstannualreport: formData.get("hasfirstannualreport") === "on",
    };

    // Validate required fields - company name, organization number, and company type are required
    if (!companyData.name?.trim()) {
      return { success: false, error: "Company name is required" };
    }

    if (!companyData.orgnumber?.trim()) {
      return { success: false, error: "Organization number is required" };
    }

    if (!companyData.type?.trim()) {
      return { success: false, error: "Company type is required" };
    }

    // Create the company
    const newCompany = await dbclient
      .insert(companies)
      .values(companyData)
      .returning();
    
    if (!newCompany || newCompany.length === 0) {
      return { success: false, error: "Could not create company" };
    }

    // Create the relationship between user and company with owner role
    const companyUserData: NewCompanyUser = {
      userid: user.userid,
      companyid: newCompany[0].companyid,
      role: "owner",
    };

    await dbclient
      .insert(companyUsers)
      .values(companyUserData);

    // Success - return the company ID for redirect
    return {
      success: true,
      companyId: newCompany[0].companyid
    };
    
  } catch (error) {
    console.error("Error creating company:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
}

// Separate action for redirecting after successful company creation
export async function redirectToCompany(companyId: string) {
  redirect(`/dashboard/${companyId}`);
}

export async function checkUserHasCompanies(): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) {
      return false;
    }

    const userCompanies = await dbclient
      .select({ companyid: companies.companyid })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyid, companies.companyid))
      .where(eq(companyUsers.userid, user.userid))
      .limit(1);

    return userCompanies.length > 0;
  } catch (error) {
    console.error("Error checking user companies:", error);
    return false;
  }
}
