"use client";

import * as React from "react";
import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/components/ui/sidebar";
import { Button } from "@/app/components/ui/button";
import { useIsMobile } from "@/hooks/usemobile";
import { GeneralSettings } from "./settingsections/generalsettings";
import { useLanguage } from "@/hooks/uselanguage";

export function UserSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const { ttt } = useLanguage();

  const data = {
    nav: [
      { name: ttt("General"), icon: Settings, component: <GeneralSettings /> },
      { name: ttt("Notifications"), icon: Bell },
      { name: ttt("Navigation"), icon: Menu },
      { name: ttt("Home"), icon: Home },
      { name: ttt("Appearance"), icon: Paintbrush },
      { name: ttt("Messages & media"), icon: MessageCircle },
      { name: ttt("Language & region"), icon: Globe },
      { name: ttt("Accessibility"), icon: Keyboard },
      { name: ttt("Mark as read"), icon: Check },
      { name: ttt("Audio & video"), icon: Video },
      { name: ttt("Connected accounts"), icon: Link },
      { name: ttt("Privacy & visibility"), icon: Lock },
    ],
  };

  const [activeSection, setActiveSection] = React.useState(data.nav[0]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar
            collapsible="none"
            className={`${
              isMobile ? (mobileSidebarOpen ? "flex w-48" : "hidden") : "flex"
            }`}
          >
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeSection.name}
                          onClick={() => {
                            setActiveSection(item);
                            if (isMobile) {
                              setMobileSidebarOpen(false); // Close mobile sidebar after selection
                            }
                          }}
                        >
                          <a href="#">
                            <item.icon />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header
              className={`flex h-12 shrink-0 items-center border-b pr-12 px-4`}
            >
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 -ml-2"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              )}
              {(!isMobile || !mobileSidebarOpen) && (
                <h2 className="text-lg font-semibold">{activeSection.name}</h2>
              )}
            </header>
            <div
              className={`flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0 ${
                isMobile && mobileSidebarOpen ? "hidden" : ""
              }`}
            >
              {activeSection.component}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
