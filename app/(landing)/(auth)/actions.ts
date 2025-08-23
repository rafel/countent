"use server";

import { getUser, auth } from "@/lib/user";
import { signOut } from "@/lib/user";
import {
  invalidateSession,
  invalidateAllUserSessions,
  deleteUser,
} from "@/lib/db/queries/user";
import { deleteWorkspace, getUserWorkspaces } from "@/lib/db/queries/workspace";

export async function deleteUserAccount(
  workspacesToDelete: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get all companies where user is owner
    const ownedWorkspaces = await getUserWorkspaces(user.userid, "owner");

    // Check if user has selected what to do with all owned companies
    const ownedWorkspaceIds = ownedWorkspaces.map(
      (w) => w.workspace.workspaceid
    );
    const unhandledWorkspaces = ownedWorkspaceIds.filter(
      (id) => !workspacesToDelete.includes(id)
    );

    if (unhandledWorkspaces.length > 0) {
      return {
        success: false,
        error:
          "You must decide what to do with all companies you own before deleting your account.",
      };
    }

    // Delete companies that user chose to delete
    for (const workspaceId of workspacesToDelete) {
      // Verify user owns this company
      const isOwner = ownedWorkspaceIds.includes(workspaceId);
      if (!isOwner) {
        return {
          success: false,
          error: "You can only delete companies you own.",
        };
      }

      await deleteWorkspace(user.userid, workspaceId);
    }

    // Finally delete the user
    await deleteUser(user.userid);

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
