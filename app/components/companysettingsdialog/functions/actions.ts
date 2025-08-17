"use server";

import { dbclient } from "@/db/db";
import {
  companies,
  companyUsers,
  companyInvites,
  companyUserDuties,
  users,
  Company,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/utils/user";

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  owner: 3,
  admin: 2,
  user: 1,
};

export async function getUserRole(
  companyId: string,
  userId: string
): Promise<string | null> {
  try {
    const userRole = await dbclient
      .select({ role: companyUsers.role })
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyid, companyId),
          eq(companyUsers.userid, userId)
        )
      )
      .limit(1);

    return userRole[0]?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

export async function canManageUser(
  managerId: string,
  targetUserId: string,
  companyId: string
): Promise<boolean> {
  try {
    const managerRole = await getUserRole(companyId, managerId);
    const targetRole = await getUserRole(companyId, targetUserId);

    if (!managerRole || !targetRole) return false;

    const managerLevel =
      ROLE_HIERARCHY[managerRole as keyof typeof ROLE_HIERARCHY] || 0;
    const targetLevel =
      ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0;

    // Owner can manage everyone, Admin can manage user and admin (but not owner)
    return managerLevel > targetLevel;
  } catch (error) {
    console.error("Error checking user management permissions:", error);
    return false;
  }
}

export async function getCompanyById(
  companyId: string
): Promise<Company | null> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Verify user has access to this company
    const userAccess = await dbclient
      .select()
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyid, companyId),
          eq(companyUsers.userid, user.userid)
        )
      )
      .limit(1);

    if (!userAccess || userAccess.length === 0) {
      return null; // Return null instead of throwing error
    }

    const company = await dbclient
      .select()
      .from(companies)
      .where(eq(companies.companyid, companyId))
      .limit(1);

    return company[0] || null;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
}

export async function updateCompany(
  companyId: string,
  companyData: Partial<Company>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Verify user has access to this company
    const userAccess = await dbclient
      .select()
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyid, companyId),
          eq(companyUsers.userid, user.userid)
        )
      )
      .limit(1);

    if (!userAccess || userAccess.length === 0) {
      return { success: false, error: "You no longer have access to this company" };
    }

    await dbclient
      .update(companies)
      .set({
        ...companyData,
        updatedat: new Date(),
      })
      .where(eq(companies.companyid, companyId));

    return { success: true };
  } catch (error) {
    console.error("Error updating company:", error);
    return { success: false, error: "Failed to update company" };
  }
}

export async function getCompanyUsers(companyId: string) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Verify user has access to this company
    const userAccess = await dbclient
      .select()
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyid, companyId),
          eq(companyUsers.userid, user.userid)
        )
      )
      .limit(1);

    if (!userAccess || userAccess.length === 0) {
      return []; // Return empty array instead of throwing error
    }

    const usersInCompany = await dbclient
      .select({
        userid: users.userid,
        name: users.name,
        email: users.email,
        role: companyUsers.role,
        companyuserid: companyUsers.companyuserid,
      })
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userid, users.userid))
      .where(eq(companyUsers.companyid, companyId));

    // Get current user's role for permission checking
    const currentUserRole = await getUserRole(companyId, user.userid);

    // Resolve all canManage promises
    const usersWithPermissions = await Promise.all(
      usersInCompany.map(async (u) => ({
        ...u,
        canManage: await canManageUser(user.userid, u.userid, companyId),
        currentUserRole: currentUserRole || undefined, // Convert null to undefined
      }))
    );

    return usersWithPermissions;
  } catch (error) {
    console.error("Error fetching company users:", error);
    return [];
  }
}

export async function inviteUserToCompany(
  companyId: string,
  email: string,
  role: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if current user can invite (must be owner or admin)
    const currentUserRole = await getUserRole(companyId, user.userid);
    if (!currentUserRole || !["owner", "admin"].includes(currentUserRole)) {
      return {
        success: false,
        error: "Insufficient permissions to invite users",
      };
    }

      // Cannot invite as owner - ownership can only be transferred to existing members
  if (role === "owner") {
    return { success: false, error: "Cannot invite new users as owner. Ownership can only be transferred to existing team members." };
  }

    // Check if user is already a member
    const existingUser = await dbclient
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      const existingMembership = await dbclient
        .select()
        .from(companyUsers)
        .where(
          and(
            eq(companyUsers.companyid, companyId),
            eq(companyUsers.userid, existingUser[0].userid)
          )
        )
        .limit(1);

      if (existingMembership.length > 0) {
        return {
          success: false,
          error: "User is already a member of this company",
        };
      }

      // User exists but not in company - add them directly
      await dbclient.insert(companyUsers).values({
        userid: existingUser[0].userid,
        companyid: companyId,
        role: role,
      });

      return { success: true };
    }

    // Check if invite already exists
    const existingInvite = await dbclient
      .select()
      .from(companyInvites)
      .where(
        and(
          eq(companyInvites.companyid, companyId),
          eq(companyInvites.email, email)
        )
      )
      .limit(1);

    if (existingInvite.length > 0) {
      // Update existing invite
      await dbclient
        .update(companyInvites)
        .set({
          role: role,
          invitedby: user.userid,
          createdat: new Date(),
        })
        .where(eq(companyInvites.inviteid, existingInvite[0].inviteid));
    } else {
      // Create new invite
      await dbclient.insert(companyInvites).values({
        companyid: companyId,
        email: email,
        role: role,
        invitedby: user.userid,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error inviting user:", error);
    return { success: false, error: "Failed to invite user" };
  }
}

export async function removeUserFromCompany(
  companyId: string,
  targetUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check permissions
    const canManage = await canManageUser(user.userid, targetUserId, companyId);
    if (!canManage) {
      return {
        success: false,
        error: "Insufficient permissions to remove this user",
      };
    }

    // Cannot remove yourself
    if (user.userid === targetUserId) {
      return {
        success: false,
        error: "Cannot remove yourself from the company",
      };
    }

    // Remove user from company
    await dbclient
      .delete(companyUsers)
      .where(
        and(
          eq(companyUsers.companyid, companyId),
          eq(companyUsers.userid, targetUserId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error removing user:", error);
    return { success: false, error: "Failed to remove user" };
  }
}

export async function updateUserRole(
  companyId: string,
  targetUserId: string,
  newRole: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const currentUserRole = await getUserRole(companyId, user.userid);
    const targetUserRole = await getUserRole(companyId, targetUserId);

    if (!currentUserRole || !targetUserRole) {
      return { success: false, error: "User roles not found" };
    }

    // Check permissions based on role hierarchy
    if (!canManageUser(user.userid, targetUserId, companyId)) {
      return {
        success: false,
        error: "Insufficient permissions to edit this user",
      };
    }

    // Admin cannot promote to owner
    if (currentUserRole === "admin" && newRole === "owner") {
      return { success: false, error: "Only owners can assign ownership" };
    }

    // If promoting to owner, demote current owner to admin
    if (newRole === "owner") {
      // First, demote the current user from owner to admin
      await dbclient
        .update(companyUsers)
        .set({ role: "admin" })
        .where(
          and(
            eq(companyUsers.companyid, companyId),
            eq(companyUsers.userid, user.userid)
          )
        );
    }

    // Update target user's role
    await dbclient
      .update(companyUsers)
      .set({ role: newRole })
      .where(
        and(
          eq(companyUsers.companyid, companyId),
          eq(companyUsers.userid, targetUserId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function getPendingInvites(companyId: string) {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Verify user has access to this company
    const userRole = await getUserRole(companyId, user.userid);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      throw new Error("Access denied");
    }

    const invites = await dbclient
      .select({
        inviteid: companyInvites.inviteid,
        email: companyInvites.email,
        role: companyInvites.role,
        createdat: companyInvites.createdat,
        inviterName: users.name,
        inviterEmail: users.email,
      })
      .from(companyInvites)
      .innerJoin(users, eq(companyInvites.invitedby, users.userid))
      .where(eq(companyInvites.companyid, companyId));

    return invites;
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    return [];
  }
}

export async function deleteCompany(
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user is owner of the company
    const userRole = await getUserRole(companyId, user.userid);
    if (userRole !== "owner") {
      return { 
        success: false, 
        error: "Only company owners can delete the company" 
      };
    }

    // Delete related data in correct order (due to foreign key constraints)
    // 1. Delete company invites
    await dbclient
      .delete(companyInvites)
      .where(eq(companyInvites.companyid, companyId));

    // 2. Delete company user duties (if any exist)
    const companyUserIds = await dbclient
      .select({ companyuserid: companyUsers.companyuserid })
      .from(companyUsers)
      .where(eq(companyUsers.companyid, companyId));

    if (companyUserIds.length > 0) {
      await dbclient
        .delete(companyUserDuties)
        .where(
          eq(companyUserDuties.companyuserid, companyUserIds[0].companyuserid)
        );
    }

    // 3. Delete company users
    await dbclient
      .delete(companyUsers)
      .where(eq(companyUsers.companyid, companyId));

    // 4. Finally delete the company
    await dbclient
      .delete(companies)
      .where(eq(companies.companyid, companyId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting company:", error);
    return { success: false, error: "Failed to delete company" };
  }
}
