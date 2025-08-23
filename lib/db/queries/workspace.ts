import { db } from "@/lib/db";
import {
  workspaces,
  workspaceusers,
  workspaceinvites,
  Workspace,
  WorkspaceUser,
  WorkspaceInvite,
  WorkspaceType,
  WorkspaceUserRole,
  UserWorkspace,
  WorkspaceInviteWithWorkspaceAndInviter,
  WorkspaceWithStripeSubscription,
  WorkspaceSettings,
} from "@/lib/db/tables/workspace";
import { users, User } from "@/lib/db/tables/user";
import { eq, and, desc, lt, isNotNull } from "drizzle-orm";
import { getWorkspaceStripeSubscription } from "./stripe";

export async function getUserDefaultWorkspace(
  userId: string
): Promise<Workspace | null> {
  const userWorkspaces = await getUserWorkspaces(userId);

  // First try to find a personal workspace
  const personalWorkspace = userWorkspaces.find(
    (uw) => uw.workspace.type === "personal"
  );
  if (personalWorkspace) {
    return personalWorkspace.workspace;
  }

  // Otherwise return the first workspace where user is owner
  const ownedWorkspace = userWorkspaces.find((uw) => uw.role === "owner");
  if (ownedWorkspace) {
    return ownedWorkspace.workspace;
  }

  // Finally return any workspace
  return userWorkspaces[0]?.workspace || null;
}

export async function createWorkspaceInvite(
  workspaceId: string,
  email: string,
  role: WorkspaceUserRole,
  invitedBy: string,
  expiresAt?: Date
): Promise<WorkspaceInvite | null> {
  try {
    // Check if user is already a member of the workspace
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      const userAccess = await checkUserWorkspaceAccess(
        existingUser[0].userid,
        workspaceId
      );
      if (userAccess) {
        throw new Error("User is already a member of this workspace");
      }
    }

    // Check if there's already a pending invite
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
      throw new Error("Invite already exists for this email");
    }

    // Create the invite
    const [invite] = await db
      .insert(workspaceinvites)
      .values({
        workspaceid: workspaceId,
        email,
        role,
        invitedby: invitedBy,
        expiresat: expiresAt,
      })
      .returning();

    return invite;
  } catch (error) {
    console.error("Error creating workspace invite:", error);
    return null;
  }
}

export async function getWorkspaceInvites(
  workspaceId: string
): Promise<(WorkspaceInvite & { inviter: User })[]> {
  try {
    const results = await db
      .select()
      .from(workspaceinvites)
      .innerJoin(users, eq(workspaceinvites.invitedby, users.userid))
      .where(eq(workspaceinvites.workspaceid, workspaceId))
      .orderBy(desc(workspaceinvites.createdat));

    return results.map((result) => ({
      ...result.workspaceinvites,
      inviter: result.users,
    }));
  } catch (error) {
    console.error("Error getting workspace invites:", error);
    return [];
  }
}

export async function getWorkspaceInviteById(
  inviteId: string
): Promise<WorkspaceInvite | null> {
  try {
    const [invite] = await db
      .select()
      .from(workspaceinvites)
      .where(eq(workspaceinvites.inviteid, inviteId))
      .limit(1);

    return invite || null;
  } catch (error) {
    console.error("Error getting workspace invite by ID:", error);
    return null;
  }
}

export async function getUserWorkspaceInvites(
  email: string
): Promise<WorkspaceInviteWithWorkspaceAndInviter[]> {
  try {
    const results = await db
      .select()
      .from(workspaceinvites)
      .innerJoin(
        workspaces,
        eq(workspaceinvites.workspaceid, workspaces.workspaceid)
      )
      .innerJoin(users, eq(workspaceinvites.invitedby, users.userid))
      .where(eq(workspaceinvites.email, email))
      .orderBy(desc(workspaceinvites.createdat));

    return results.map((result) => ({
      ...result.workspaceinvites,
      workspace: result.workspaces,
      inviter: result.users,
    }));
  } catch (error) {
    console.error("Error getting user workspace invites:", error);
    return [];
  }
}

export async function acceptWorkspaceInvite(
  inviteId: string,
  userId: string
): Promise<boolean> {
  try {
    const invite = await getWorkspaceInviteById(inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Check if invite has expired
    if (invite.expiresat && invite.expiresat < new Date()) {
      throw new Error("Invite has expired");
    }

    // Add user to workspace
    const workspaceUser = await addUserToWorkspace(
      invite.workspaceid,
      userId,
      invite.role
    );
    if (!workspaceUser) {
      throw new Error("Failed to add user to workspace");
    }

    // Delete the invite
    await db
      .delete(workspaceinvites)
      .where(eq(workspaceinvites.inviteid, inviteId));

    return true;
  } catch (error) {
    console.error("Error accepting workspace invite:", error);
    return false;
  }
}

export async function rejectWorkspaceInvite(
  inviteId: string
): Promise<boolean> {
  try {
    await db
      .delete(workspaceinvites)
      .where(eq(workspaceinvites.inviteid, inviteId));

    return true;
  } catch (error) {
    console.error("Error rejecting workspace invite:", error);
    return false;
  }
}

export async function cancelWorkspaceInvite(
  inviteId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verify the user has permission to cancel this invite
    const invite = await getWorkspaceInviteById(inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    // Check if user is the inviter or has admin/owner role in the workspace
    const userRole = await checkUserWorkspaceAccess(userId, invite.workspaceid);
    if (
      invite.invitedby !== userId &&
      userRole !== "owner" &&
      userRole !== "admin"
    ) {
      throw new Error("Permission denied");
    }

    await db
      .delete(workspaceinvites)
      .where(eq(workspaceinvites.inviteid, inviteId));

    return true;
  } catch (error) {
    console.error("Error canceling workspace invite:", error);
    return false;
  }
}

export async function cleanupExpiredWorkspaceInvites(): Promise<number> {
  try {
    const result = await db.delete(workspaceinvites).where(
      and(
        // Only delete invites that have an expiration date set
        // and that expiration date is in the past
        isNotNull(workspaceinvites.expiresat),
        lt(workspaceinvites.expiresat, new Date())
      )
    );

    return result ? 1 : 0;
  } catch (error) {
    console.error("Error cleaning up expired workspace invites:", error);
    return 0;
  }
}

export async function deleteWorkspace(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  try {
    const userRole = await checkUserWorkspaceAccess(userId, workspaceId);
    if (userRole !== "owner") {
      return false;
    }

    // Delete workspace invites
    await db
      .delete(workspaceinvites)
      .where(eq(workspaceinvites.workspaceid, workspaceId));

    // Delete workspace users
    await db
      .delete(workspaceusers)
      .where(eq(workspaceusers.workspaceid, workspaceId));

    // Delete workspace
    await db.delete(workspaces).where(eq(workspaces.workspaceid, workspaceId));
    return true;
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return false;
  }
}

export async function createWorkspace(
  name: string,
  type: WorkspaceType,
  ownerId: string,
  description?: string,
  settings?: WorkspaceSettings
): Promise<Workspace | null> {
  try {
    const [workspace] = await db
      .insert(workspaces)
      .values({
        name,
        type,
        description,
        settings: settings || {},
      })
      .returning();

    if (workspace) {
      // Add the creator as the owner
      await addUserToWorkspace(workspace.workspaceid, ownerId, "owner");
    }

    return workspace;
  } catch (error) {
    console.error("Error creating workspace:", error);
    return null;
  }
}

export async function getWorkspaceById(
  workspaceId: string
): Promise<Workspace | null> {
  try {
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.workspaceid, workspaceId))
      .limit(1);

    return workspace || null;
  } catch (error) {
    console.error("Error getting workspace by ID:", error);
    return null;
  }
}

export async function getUserWorkspaces(
  userId: string,
  role?: WorkspaceUserRole
): Promise<UserWorkspace[]> {
  try {
    const results = await db
      .select({
        workspace: workspaces,
        role: workspaceusers.role,
      })
      .from(workspaceusers)
      .innerJoin(
        workspaces,
        eq(workspaceusers.workspaceid, workspaces.workspaceid)
      )
      .where(
        and(
          eq(workspaceusers.userid, userId),
          role ? eq(workspaceusers.role, role) : undefined
        )
      )
      .orderBy(desc(workspaces.createdat));

    return results.map((result) => ({
      workspace: result.workspace,
      role: result.role,
    }));
  } catch (error) {
    console.error("Error getting user workspaces:", error);
    return [];
  }
}

export async function getWorkspaceUsers(
  workspaceId: string
): Promise<(WorkspaceUser & { user: User })[]> {
  try {
    const results = await db
      .select()
      .from(workspaceusers)
      .innerJoin(users, eq(workspaceusers.userid, users.userid))
      .where(eq(workspaceusers.workspaceid, workspaceId))
      .orderBy(workspaceusers.createdat);

    return results.map((result) => ({
      ...result.workspaceusers,
      user: result.users,
    }));
  } catch (error) {
    console.error("Error getting workspace users:", error);
    return [];
  }
}

export async function addUserToWorkspace(
  workspaceId: string,
  userId: string,
  role: WorkspaceUserRole = "member"
): Promise<WorkspaceUser | null> {
  try {
    const [workspaceUser] = await db
      .insert(workspaceusers)
      .values({
        workspaceid: workspaceId,
        userid: userId,
        role,
      })
      .returning();

    return workspaceUser;
  } catch (error) {
    console.error("Error adding user to workspace:", error);
    return null;
  }
}

export async function removeUserFromWorkspace(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  try {
    await db
      .delete(workspaceusers)
      .where(
        and(
          eq(workspaceusers.workspaceid, workspaceId),
          eq(workspaceusers.userid, userId)
        )
      );

    return true;
  } catch (error) {
    console.error("Error removing user from workspace:", error);
    return false;
  }
}

export async function updateUserWorkspaceRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceUserRole
): Promise<boolean> {
  try {
    await db
      .update(workspaceusers)
      .set({ role })
      .where(
        and(
          eq(workspaceusers.workspaceid, workspaceId),
          eq(workspaceusers.userid, userId)
        )
      );

    return true;
  } catch (error) {
    console.error("Error updating user workspace role:", error);
    return false;
  }
}

export async function checkUserWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<WorkspaceUserRole | null> {
  try {
    const [result] = await db
      .select({ role: workspaceusers.role })
      .from(workspaceusers)
      .where(
        and(
          eq(workspaceusers.userid, userId),
          eq(workspaceusers.workspaceid, workspaceId)
        )
      )
      .limit(1);

    return result?.role || null;
  } catch (error) {
    console.error("Error checking user workspace access:", error);
    return null;
  }
}

export async function getWorkspaceForUser(
  userId: string,
  workspaceId: string
): Promise<WorkspaceWithStripeSubscription | null> {
  const userWorkspaces = await getUserWorkspaces(userId);
  const workspace = userWorkspaces.find(
    (uw) => uw.workspace.workspaceid === workspaceId
  );
  if (!workspace) {
    return null;
  }
  const stripeSubscription = await getWorkspaceStripeSubscription(
    workspace.workspace.workspaceid
  );
  return {
    ...workspace.workspace,
    role: workspace.role,
    stripeSubscription,
  };
}
