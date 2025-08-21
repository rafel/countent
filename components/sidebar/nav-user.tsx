"use client";

import {
  ChevronsUpDown,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
} from "lucide-react";

import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { User } from "@/lib/db/tables/user";
import { useLanguage } from "@/hooks/use-language";
import { commonSettings } from "@/content/common";
import { showPricingDialog } from "@/hooks/use-subscription-dialog";
import { useSubscriptionAccess } from "@/hooks/use-subscription-access";

export function NavUser({
  user,
  onOpenSettings,
  companyId,
}: {
  user: User;
  onOpenSettings: (open: boolean) => void;
  companyId?: string;
}) {
  const { isMobile } = useSidebar();
  const { ttt } = useLanguage();

  const isB2C = commonSettings.subscriptionModel === "b2c";

  // Fetch real subscription data using the client-safe hook
  const { subscriptionAccess } = useSubscriptionAccess(user.userid, companyId);

  const isFreePlan = subscriptionAccess?.plan === 'free' || !subscriptionAccess;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name ?? ""} />
                )}
                <AvatarFallback className="rounded-lg">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name ?? ""} />
                  )}
                  <AvatarFallback className="rounded-lg">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Show upgrade button for B2C free users */}
            {isB2C && isFreePlan && (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => showPricingDialog(user.userid, companyId)}>
                  <Sparkles />
                  {ttt("Upgrade to Pro")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => onOpenSettings(true)}
                className="cursor-pointer"
              >
                <Settings />
                {ttt("Account Settings")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle />
                {ttt("Help")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer"
            >
              <LogOut />
              {ttt("Log out")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
