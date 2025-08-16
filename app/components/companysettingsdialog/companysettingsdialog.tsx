"use client";

import * as React from "react";
import {
  Settings,
  Globe,
  CreditCard,
  Users,
  Calendar,
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
} from "@/app/components/ui/sidebar";
import { Button } from "@/app/components/ui/button";
import { useIsMobile } from "@/hooks/usemobile";
import { CompanyGeneralSettings } from "./settingsections/companygeneralsettings";
import { CompanyTeam } from "./settingsections/companyteam";
import { useLanguage } from "@/hooks/uselanguage";

export function CompanySettingsDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
}) {
  const isMobile = useIsMobile();
  const { ttt } = useLanguage();

  const data = {
    nav: [
      {
        name: ttt("General"),
        icon: Settings,
        component: <CompanyGeneralSettings companyId={companyId} />,
      },
      { 
        name: ttt("Team"), 
        icon: Users,
        component: <CompanyTeam companyId={companyId} />,
      },
      { name: ttt("Billing"), icon: CreditCard },
      { name: ttt("Language & region"), icon: Globe },
      { 
        name: ttt("Accounting Settings"), 
        icon: Calendar,
        component: <CompanyGeneralSettings companyId={companyId} />,
      },
    ],
  };

  const [activeSection, setActiveSection] = React.useState(data.nav[0]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">{ttt("Company Settings")}</DialogTitle>
        <DialogDescription className="sr-only">
          {`${ttt("Customize your company settings here.")}`}
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
                              setMobileSidebarOpen(false);
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
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">{ttt("Toggle menu")}</span>
                </Button>
              )}
              {(!isMobile || !mobileSidebarOpen) && (
                <h2 className="text-lg font-semibold">{activeSection.name}</h2>
              )}
            </header>
            <div
              className={`flex flex-1 flex-col overflow-y-auto p-4 ${
                isMobile && mobileSidebarOpen ? "hidden" : ""
              }`}
            >
              {activeSection.component || (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">
                    {ttt("Coming Soon")}
                  </div>
                </div>
              )}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
