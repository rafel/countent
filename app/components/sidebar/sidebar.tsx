"use client";

import * as React from "react";
import { BookOpen, Bot, Settings, SquareTerminal } from "lucide-react";

import { NavMain } from "@/app/components/sidebar/nav-main";

import { NavUser } from "@/app/components/sidebar/nav-user";
import { CompanySwitcher } from "@/app/components/sidebar/company-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/db/tables/user";
import { UserSettingsDialog } from "../usersettingsdialog/usersettingsdialog";
import { useLanguage } from "@/hooks/use-language";
import type { Company } from "@/lib/db/tables/company";
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
  const { ttt } = useLanguage();
  const [openSettings, setOpenSettings] = React.useState(false);

  // Find the current company
  const currentCompany = companies.find(
    (c) => c.companyid === currentCompanyId
  );

  const data = {
    navMain: [
      {
        title: ttt("My transactions"),
        url: "/d/transactions",
        icon: SquareTerminal,
        isActive: true,
      },
      {
        title: ttt("Invoices"),
        url: "#",
        icon: Bot,
        items: [
          {
            title: ttt("Invoices"),
            url: "#",
          },
          {
            title: ttt("Offers"),
            url: "#",
          },
          {
            title: ttt("Customers"),
            url: "#",
          },
        ],
      },
      {
        title: ttt("Salaries"),
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: ttt("Salaries"),
            url: "#",
          },
          {
            title: ttt("Employees"),
            url: "#",
          },
          {
            title: ttt("Outlays"),
            url: "#",
          },
        ],
      },
      {
        title: ttt("Company Settings"),
        url: "#",
        icon: Settings,
        isCompanySettings: true,
      },
    ],
  };

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
          <NavMain items={data.navMain} currentCompany={currentCompany} />
        )}
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onOpenSettings={setOpenSettings} />
      </SidebarFooter>
      <UserSettingsDialog open={openSettings} onOpenChange={setOpenSettings} />
      <SidebarRail />
    </Sidebar>
  );
}
