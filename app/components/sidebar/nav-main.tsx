"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/app/components/ui/sidebar";
import { CompanySettingsDialog } from "@/app/components/companysettingsdialog/companysettingsdialog";

export function NavMain({
  items,
  currentCompanyId,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isCompanySettings?: boolean;
    items?: {
      title: string;
      url: string;
      isCompanySettings?: boolean;
    }[];
  }[];
  currentCompanyId?: string;
}) {
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false);

  const handleItemClick = (item: { title: string; url: string; isCompanySettings?: boolean }) => {
    if (item.isCompanySettings && currentCompanyId) {
      setCompanySettingsOpen(true);
    } else {
      // Handle regular navigation
      window.location.href = item.url;
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            // If it's a company settings item, render as direct button
            if (item.isCompanySettings) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleItemClick(item)}
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Regular collapsible items
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild={!subItem.isCompanySettings}
                            onClick={subItem.isCompanySettings ? () => handleItemClick(subItem) : undefined}
                          >
                            {subItem.isCompanySettings ? (
                              <span>{subItem.title}</span>
                            ) : (
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* Company Settings Dialog */}
      {currentCompanyId && (
        <CompanySettingsDialog
          open={companySettingsOpen}
          onOpenChange={setCompanySettingsOpen}
          companyId={currentCompanyId}
        />
      )}
    </>
  );
}
