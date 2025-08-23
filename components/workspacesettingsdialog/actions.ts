"use server";

import { db } from "@/lib/db";
import {
  workspaces,
  workspaceusers,
  workspaceinvites,
  users,
  Workspace,
  WorkspaceUserRole,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getUser } from "@/lib/user";

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

export async function getUserWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<string | null> {
  try {
    const userRole = await db
      .select({ role: workspaceusers.role })
      .from(workspaceusers)
      .where(
        and(
          eq(workspaceusers.workspaceid, workspaceId),
          eq(workspaceusers.userid, userId)
        )
      )
      .limit(1);

    return userRole[0]?.role || null;
  } catch (error) {
    console.error("Error getting user workspace role:", error);
    return null;
  }
}

export async function canManageWorkspaceUser(
  managerId: string,
  targetUserId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const managerRole = await getUserWorkspaceRole(workspaceId, managerId);
    const targetRole = await getUserWorkspaceRole(workspaceId, targetUserId);

    if (!managerRole || !targetRole) return false;

    const managerLevel =
      ROLE_HIERARCHY[managerRole as keyof typeof ROLE_HIERARCHY] || 0;
    const targetLevel =
      ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0;

    // Manager must have higher role than target
    return managerLevel > targetLevel;
  } catch (error) {
    console.error("Error checking workspace management permissions:", error);
    return false;
  }
}

export async function updateWorkspace(
  workspaceId: string,
  data: Partial<Workspace>
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has permission to update workspace
    const userRole = await getUserWorkspaceRole(workspaceId, user.userid);
    if (!userRole || (userRole !== "owner" && userRole !== "admin")) {
      return { success: false, error: "Permission denied" };
    }

    await db
      .update(workspaces)
      .set({
        ...data,
        updatedat: new Date(),
      })
      .where(eq(workspaces.workspaceid, workspaceId));

    return { success: true };
  } catch (error) {
    console.error("Error updating workspace:", error);
    return { success: false, error: "Failed to update workspace" };
  }
}

export async function deleteWorkspace(workspaceId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user is owner
    const userRole = await getUserWorkspaceRole(workspaceId, user.userid);
    if (userRole !== "owner") {
      return {
        success: false,
        error: "Only workspace owners can delete workspaces",
      };
    }

    // Delete workspace (cascade will handle related records)
    await db.delete(workspaces).where(eq(workspaces.workspaceid, workspaceId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return { success: false, error: "Failed to delete workspace" };
  }
}

export async function getWorkspaceUsers(workspaceId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has access to workspace
    const userRole = await getUserWorkspaceRole(workspaceId, user.userid);
    if (!userRole) {
      return { success: false, error: "Access denied" };
    }

    const workspaceUsers = await db
      .select({
        workspaceid: workspaceusers.workspaceid,
        userid: workspaceusers.userid,
        role: workspaceusers.role,
        createdat: workspaceusers.createdat,
        user: {
          userid: users.userid,
          name: users.name,
          email: users.email,
        },
      })
      .from(workspaceusers)
      .innerJoin(users, eq(workspaceusers.userid, users.userid))
      .where(eq(workspaceusers.workspaceid, workspaceId))
      .orderBy(workspaceusers.createdat);

    return { success: true, data: workspaceUsers };
  } catch (error) {
    console.error("Error getting workspace users:", error);
    return { success: false, error: "Failed to get workspace users" };
  }
}

export async function getPendingWorkspaceInvites(workspaceId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has access to workspace
    const userRole = await getUserWorkspaceRole(workspaceId, user.userid);
    if (!userRole || (userRole !== "owner" && userRole !== "admin")) {
      return { success: false, error: "Permission denied" };
    }

    const invites = await db
      .select({
        inviteid: workspaceinvites.inviteid,
        workspaceid: workspaceinvites.workspaceid,
        email: workspaceinvites.email,
        role: workspaceinvites.role,
        invitedby: workspaceinvites.invitedby,
        createdat: workspaceinvites.createdat,
        expiresat: workspaceinvites.expiresat,
        inviter: {
          userid: users.userid,
          name: users.name,
          email: users.email,
        },
      })
      .from(workspaceinvites)
      .innerJoin(users, eq(workspaceinvites.invitedby, users.userid))
      .where(eq(workspaceinvites.workspaceid, workspaceId))
      .orderBy(workspaceinvites.createdat);

    return { success: true, data: invites };
  } catch (error) {
    console.error("Error getting pending workspace invites:", error);
    return { success: false, error: "Failed to get pending invites" };
  }
}

export async function inviteUserToWorkspace(
  workspaceId: string,
  email: string,
  role: string
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has permission to invite
    const userRole = await getUserWorkspaceRole(workspaceId, user.userid);
    if (!userRole || (userRole !== "owner" && userRole !== "admin")) {
      return { success: false, error: "Permission denied" };
    }

    // Check if user is already a member
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      const existingMember = await db
        .select()
        .from(workspaceusers)
        .where(
          and(
            eq(workspaceusers.workspaceid, workspaceId),
            eq(workspaceusers.userid, existingUser[0].userid)
          )
        )
        .limit(1);

      if (existingMember.length > 0) {
        return {
          success: false,
          error: "User is already a member of this workspace",
        };
      }
    }

    // Check if invite already exists
    const existingInvite = await db
      .select()
      .from(workspaceinvites)
      .where(
        and(
          eq(workspaceinvites.workspaceid, workspaceId),
          eq(workspaceinvites.email, email)
        )
      )
      .limit(1);

    if (existingInvite.length > 0) {
      return { success: false, error: "Invite already exists for this email" };
    }

    // Create invite
    await db.insert(workspaceinvites).values({
      workspaceid: workspaceId,
      email,
      role: role as WorkspaceUserRole,
      invitedby: user.userid,
      expiresat: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error("Error inviting user to workspace:", error);
    return { success: false, error: "Failed to send invite" };
  }
}

export async function removeUserFromWorkspace(
  workspaceId: string,
  targetUserId: string
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has permission to remove
    const canManage = await canManageWorkspaceUser(
      user.userid,
      targetUserId,
      workspaceId
    );
    if (!canManage) {
      return { success: false, error: "Permission denied" };
    }

    // Remove user from workspace
    await db
      .delete(workspaceusers)
      .where(
        and(
          eq(workspaceusers.workspaceid, workspaceId),
          eq(workspaceusers.userid, targetUserId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error removing user from workspace:", error);
    return { success: false, error: "Failed to remove user" };
  }
}

export async function updateUserWorkspaceRole(
  workspaceId: string,
  targetUserId: string,
  newRole: string
) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check if user has permission to update roles
    const canManage = await canManageWorkspaceUser(
      user.userid,
      targetUserId,
      workspaceId
    );
    if (!canManage) {
      return { success: false, error: "Permission denied" };
    }

    // Update user role
    await db
      .update(workspaceusers)
      .set({ role: newRole as WorkspaceUserRole })
      .where(
        and(
          eq(workspaceusers.workspaceid, workspaceId),
          eq(workspaceusers.userid, targetUserId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error updating user workspace role:", error);
    return { success: false, error: "Failed to update role" };
  }
}
