"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/app/components/sidebar/nav-main";
import { NavProjects } from "@/app/components/sidebar/nav-projects";
import { NavUser } from "@/app/components/sidebar/nav-user";
import { TeamSwitcher } from "@/app/components/sidebar/team-switcher";
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

// This is sample data.

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const [openSettings, setOpenSettings] = React.useState(false);
  const { ttt } = useLanguage();
  const data = {
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
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
        title: ttt("Settings"),
        url: "#",
        icon: Settings2,
        items: [
          {
            title: ttt("General"),
            url: "#",
          },
          {
            title: ttt("Team"),
            url: "#",
          },
          {
            title: ttt("Billing"),
            url: "#",
          },
          {
            title: ttt("Limits"),
            url: "#",
          },
        ],
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
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
