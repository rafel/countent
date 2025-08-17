"use client";

import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar";
import { useLanguage } from "@/hooks/uselanguage";

export function NavChats() {
  const { isMobile } = useSidebar();
  const { ttt } = useLanguage();
  const chats = [
    {
      name: "Last years tax",
      url: "#",
    },
    {
      name: "Company car",
      url: "#",
    },
  ];
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{ttt("Conversations")}</SidebarGroupLabel>
      <SidebarMenuItem>
        <SidebarMenuButton className="text-sidebar-foreground/70">
          <Plus className="text-sidebar-foreground/70" />
          <span>{ttt("New Chat")}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenu>
        {chats.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">{ttt("More")}</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="text-muted-foreground" />
                  <span>{ttt("Rename")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 cursor-pointer">
                  <Trash2 className="text-red-500" />
                  <span>{ttt("Delete")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>{ttt("More")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
