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
import { useLanguage } from "@/hooks/uselanguage";
import { Company } from "@/db/tables/company";

export function NavMain({
  items,
  currentCompany,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isCompanySettings?: boolean;
    items?:
      | {
          title: string;
          url: string;
          isCompanySettings?: boolean;
        }[]
      | undefined;
  }[];
  currentCompany: Company;
}) {
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false);
  const { ttt } = useLanguage();
  const handleItemClick = (item: {
    title: string;
    url: string;
    isCompanySettings?: boolean;
  }) => {
    if (item.isCompanySettings) {
      setCompanySettingsOpen(true);
    } else {
      // Handle regular navigation
      window.location.href = item.url;
    }
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{ttt("Platform")}</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => {
            // If it's a company settings item, render as direct button
            if (item.isCompanySettings || !item.items) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            // Regular items with potential sub-items
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
                            onClick={
                              subItem.isCompanySettings
                                ? () => handleItemClick(subItem)
                                : undefined
                            }
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
              <CompanySettingsDialog
          open={companySettingsOpen}
          onOpenChange={setCompanySettingsOpen}
          company={currentCompany}
        />
    </>
  );
}
