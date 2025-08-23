"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import {
  getWorkspaceIcon,
  getWorkspaceTypeTranslationKey,
} from "@/components/shared/workspace-icons";
import { Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/hooks/use-language";
import { Workspace, WorkspaceSettings } from "@/lib/db/tables/workspace";

export function WorkspaceSwitcher({
  workspaces,
  workspaceid,
}: {
  workspaces: Workspace[];
  workspaceid: string;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { ttt } = useLanguage();

  const activeWorkspace =
    workspaces.find((w) => w.workspaceid === workspaceid) || workspaces[0];

  const ActiveWorkspaceIcon = activeWorkspace
    ? getWorkspaceIcon((activeWorkspace.settings as WorkspaceSettings)?.icon)
    : Briefcase;

  const handleCreateWorkspace = () => {
    router.push("/d/new");
  };

  const handleWorkspaceSelect = (workspaceId: string) => {
    router.push(`/d/${workspaceId}`);
  };

  if (!activeWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={handleCreateWorkspace}
            className="text-sidebar-foreground/70"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Plus className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {ttt("Create Workspace")}
              </span>
              <span className="truncate text-xs">No workspaces yet</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  console.log(activeWorkspace);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <ActiveWorkspaceIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeWorkspace.name}
                </span>
                <span className="truncate text-xs">
                  {ttt(getWorkspaceTypeTranslationKey(activeWorkspace.type))}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              {ttt("Workspaces")}
            </DropdownMenuLabel>
            {workspaces.map((workspace, index) => {
              const WorkspaceIcon = getWorkspaceIcon(
                (workspace.settings as WorkspaceSettings)?.icon
              );
              return (
                <DropdownMenuItem
                  key={workspace.workspaceid}
                  onClick={() => handleWorkspaceSelect(workspace.workspaceid)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <WorkspaceIcon className="size-3.5 shrink-0" />
                  </div>
                  {workspace.name || "Unnamed Workspace"}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={handleCreateWorkspace}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                {ttt("Create Workspace")}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
