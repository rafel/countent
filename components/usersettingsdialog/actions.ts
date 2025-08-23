"use server";

import { getUser } from "@/lib/user";
import { getUserWorkspaces } from "@/lib/db/queries/workspace";

export async function getOwnedWorspaces() {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated", data: [] };
    }

    const ownedWorkspaces = await getUserWorkspaces(user.userid, "owner");
    return { success: true, data: ownedWorkspaces };
  } catch (error) {
    console.error("Error fetching owned workspaces:", error);
    return { success: false, error: "Failed to fetch workspaces", data: [] };
  }
}
