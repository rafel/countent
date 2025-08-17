"use server";

import { dbclient } from "@/db/db";
import {
  users,
  companies,
  companyUsers,
  companyInvites,
  companyUserDuties,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser, auth } from "@/utils/user";
import { signOut } from "@/utils/user";
import { invalidateSession, invalidateAllUserSessions } from "@/utils/auth";

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
    const ownedCompanies = await dbclient
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

export async function deleteUserAccount(
  companiesToDelete: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get all companies where user is owner
    const ownedCompanies = await dbclient
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

    // Check if user has selected what to do with all owned companies
    const ownedCompanyIds = ownedCompanies.map((c) => c.companyid);
    const unhandledCompanies = ownedCompanyIds.filter(
      (id) => !companiesToDelete.includes(id)
    );

    if (unhandledCompanies.length > 0) {
      return {
        success: false,
        error:
          "You must decide what to do with all companies you own before deleting your account.",
      };
    }

    // Delete companies that user chose to delete
    for (const companyId of companiesToDelete) {
      // Verify user owns this company
      const isOwner = ownedCompanyIds.includes(companyId);
      if (!isOwner) {
        return {
          success: false,
          error: "You can only delete companies you own.",
        };
      }

      // Delete company data in correct order (due to foreign key constraints)
      // 1. Delete company invites
      await dbclient
        .delete(companyInvites)
        .where(eq(companyInvites.companyid, companyId));

      // 2. Delete company user duties
      const companyUserIds = await dbclient
        .select({ companyuserid: companyUsers.companyuserid })
        .from(companyUsers)
        .where(eq(companyUsers.companyid, companyId));

      for (const { companyuserid } of companyUserIds) {
        await dbclient
          .delete(companyUserDuties)
          .where(eq(companyUserDuties.companyuserid, companyuserid));
      }

      // 3. Delete company users
      await dbclient
        .delete(companyUsers)
        .where(eq(companyUsers.companyid, companyId));

      // 4. Delete the company
      await dbclient
        .delete(companies)
        .where(eq(companies.companyid, companyId));
    }

    // Remove user from all remaining companies
    await dbclient
      .delete(companyUsers)
      .where(eq(companyUsers.userid, user.userid));

    // Delete user's invitations
    await dbclient
      .delete(companyInvites)
      .where(eq(companyInvites.email, user.email));

    // Finally delete the user
    await dbclient.delete(users).where(eq(users.userid, user.userid));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return { success: false, error: "Failed to delete account" };
  }
}

export async function logoutUser(): Promise<{ success: boolean }> {
  try {
    // Get current session to invalidate it
    const session = await auth();
    if (session?.sessionToken) {
      await invalidateSession(session.sessionToken);
    }
    
    await signOut({ redirectTo: "/" });
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
}

export async function logoutAllDevices(): Promise<{ success: boolean }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false };
    }
    
    // Invalidate ALL sessions for this user
    await invalidateAllUserSessions(user.userid);
    
    // Also sign out the current session
    await signOut({ redirectTo: "/" });
    return { success: true };
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    return { success: false };
  }
}
