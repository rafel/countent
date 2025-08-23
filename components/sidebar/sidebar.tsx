"use client";

import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";

import { NavUser } from "@/components/sidebar/nav-user";
import { WorkspaceSwitcher } from "@/components/sidebar/workspace-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/lib/db/tables/user";
import { UserSettingsDialog } from "../usersettingsdialog/usersettingsdialog";
import { NavChats } from "./nav-chats";
import { Workspace } from "@/lib/db/tables/workspace";

export function AppSidebar({
  user,
  workspaces,
  workspaceid,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User;
  workspaces: Workspace[];
  workspaceid: string;
}) {
  const [openSettings, setOpenSettings] = React.useState(false);

  const currentWorkspace = workspaces.find(
    (w) => w.workspaceid === workspaceid
  );

  if (!workspaceid) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} workspaceid={workspaceid} />
      </SidebarHeader>
      <SidebarContent>
        {currentWorkspace && (
          <NavMain currentWorkspace={currentWorkspace} userId={user.userid} />
        )}
        <NavChats workspaceid={workspaceid} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onOpenSettings={setOpenSettings} />
      </SidebarFooter>
      <UserSettingsDialog
        open={openSettings}
        onOpenChange={setOpenSettings}
        workspaceid={workspaceid}
      />
      <SidebarRail />
    </Sidebar>
  );
}
