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
} from "@/app/components/ui/sidebar";
import { User } from "@/db/tables/user";
import { UserSettingsDialog } from "../usersettingsdialog/usersettingsdialog";
import { useLanguage } from "@/hooks/uselanguage";
import { Company } from "@/db/tables/company";
import { Chat } from "@/db/tables/chat";
import { NavChats } from "./nav-chats";

export function AppSidebar({
  user,
  currentCompanyId,
  companies = [],
  chats = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: User;
  currentCompanyId?: string;
  companies?: Company[];
  chats?: Chat[];
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
        url: "/dashboard/transactions",
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
        <NavChats 
          chats={chats}
          currentCompanyId={currentCompanyId}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onOpenSettings={setOpenSettings} />
      </SidebarFooter>
      <UserSettingsDialog open={openSettings} onOpenChange={setOpenSettings} />
      <SidebarRail />
    </Sidebar>
  );
}
