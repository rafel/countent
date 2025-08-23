"use server";

import { getUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { createWorkspace, getUserWorkspaces } from "@/lib/db/queries/workspace";
import { WorkspaceType } from "@/lib/db/tables/workspace";
import { z } from "zod";

export async function createWorkspaceAction(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const schema = z.object({
      name: z.string().min(1).max(255),
      type: z
        .enum(["personal", "company"] as [WorkspaceType, ...WorkspaceType[]])
        .default("personal"),
      description: z.string().max(255).optional(),
      icon: z.string().optional(),
    });

    const workspaceData = schema.parse({
      name: formData.get("name") as string,
      type: (formData.get("type") as WorkspaceType) || "personal",
      description: (formData.get("description") as string) || undefined,
      icon: (formData.get("icon") as string) || "briefcase",
    });

    // Validate required fields - workspace name and type are required
    if (!workspaceData.name?.trim()) {
      return { success: false, error: "Workspace name is required" };
    }

    if (!workspaceData.type) {
      return { success: false, error: "Workspace type is required" };
    }

    // Create the workspace with settings
    const settings = {
      icon: workspaceData.icon,
    };

    const newWorkspace = await createWorkspace(
      workspaceData.name,
      workspaceData.type,
      user.userid,
      workspaceData.description,
      settings
    );

    if (!newWorkspace) {
      return { success: false, error: "Could not create workspace" };
    }

    return {
      success: true,
      workspaceId: newWorkspace.workspaceid,
    };
  } catch (error) {
    console.error("Error creating workspace:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Separate action for redirecting after successful workspace creation
export async function redirectToWorkspace(workspaceId: string) {
  redirect(`/d/${workspaceId}`);
}

export async function checkUserHasWorkspaces(): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) {
      return false;
    }

    const userWorkspaces = await getUserWorkspaces(user.userid);

    return userWorkspaces.length > 0;
  } catch (error) {
    console.error("Error checking user workspaces:", error);
    return false;
  }
}
