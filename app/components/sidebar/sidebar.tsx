"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/app/components/sidebar/nav-main";
import { NavProjects } from "@/app/components/sidebar/nav-projects";
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

  const data = {
    navMain: [
      {
        title: ttt("Playground"),
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: ttt("History"),
            url: "#",
          },
          {
            title: ttt("Starred"),
            url: "#",
          },
          {
            title: ttt("Settings"),
            url: "#",
          },
        ],
      },
      {
        title: ttt("Models"),
        url: "#",
        icon: Bot,
        items: [
          {
            title: ttt("Genesis"),
            url: "#",
          },
          {
            title: ttt("Explorer"),
            url: "#",
          },
          {
            title: ttt("Quantum"),
            url: "#",
          },
        ],
      },
      {
        title: ttt("Documentation"),
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: ttt("Introduction"),
            url: "#",
          },
          {
            title: ttt("Get Started"),
            url: "#",
          },
          {
            title: ttt("Tutorials"),
            url: "#",
          },
          {
            title: ttt("Changelog"),
            url: "#",
          },
        ],
      },
      {
        title: ttt("Company Settings"),
        url: "#",
        icon: Settings2,
        isCompanySettings: true,
      },
    ],
    projects: [
      {
        name: ttt("Design Engineering"),
        url: "#",
        icon: Frame,
      },
      {
        name: ttt("Sales & Marketing"),
        url: "#",
        icon: PieChart,
      },
      {
        name: ttt("Travel"),
        url: "#",
        icon: Map,
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
        <NavMain items={data.navMain} currentCompanyId={currentCompanyId} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onOpenSettings={setOpenSettings} />
      </SidebarFooter>
      <UserSettingsDialog open={openSettings} onOpenChange={setOpenSettings} />
      <SidebarRail />
    </Sidebar>
  );
}
