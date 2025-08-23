"use server";

import { getUser } from "@/lib/user";
import { redirect } from "next/navigation";
import {
  getUserWorkspaceInvites,
  acceptWorkspaceInvite,
  rejectWorkspaceInvite,
} from "@/lib/db/queries/workspace";
import { WorkspaceInviteWithWorkspaceAndInviter } from "@/lib/db/tables/workspace";

export async function getPendingInvitesForUser(
  email: string
): Promise<WorkspaceInviteWithWorkspaceAndInviter[]> {
  try {
    return await getUserWorkspaceInvites(email);
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    return [];
  }
}

export async function acceptInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string; workspaceId?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    await acceptWorkspaceInvite(inviteId, user.userid);

    return { success: true };
  } catch (error) {
    console.error("Error accepting invite:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

export async function declineInvite(
  inviteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    await rejectWorkspaceInvite(inviteId);

    return { success: true };
  } catch (error) {
    console.error("Error declining invite:", error);
    return { success: false, error: "Failed to decline invitation" };
  }
}

export async function redirectToDashboard() {
  redirect("/d");
}
