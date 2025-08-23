"use client";

import * as React from "react";

import { NavMain } from "@/components/sidebar/nav-main";

import { NavUser } from "@/components/sidebar/nav-user";
import { CompanySwitcher } from "@/components/sidebar/company-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "@/lib/db/tables/user";
import { UserSettingsDialog } from "../usersettingsdialog/usersettingsdialog";
import { Company } from "@/lib/db/tables/company";
import { NavChats } from "./nav-chats";

export function AppSidebar({
  user,
  currentCompanyId,
  companies = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User;
  currentCompanyId?: string;
  companies?: Company[];
}) {
  const [openSettings, setOpenSettings] = React.useState(false);

  const currentCompany = companies.find(
    (c) => c.companyid === currentCompanyId
  );

  if (!currentCompanyId) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanySwitcher
          companies={companies}
          currentCompanyId={currentCompanyId}
        />
      </SidebarHeader>
      <SidebarContent>
        {currentCompany && (
          <NavMain currentCompany={currentCompany} userId={user.userid} />
        )}
        <NavChats currentCompanyId={currentCompanyId} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={user}
          onOpenSettings={setOpenSettings}
          companyId={currentCompanyId}
        />
      </SidebarFooter>
      <UserSettingsDialog
        open={openSettings}
        onOpenChange={setOpenSettings}
        companyId={currentCompanyId}
      />
      <SidebarRail />
    </Sidebar>
  );
}
