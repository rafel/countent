"use client";

import { ChevronRight, Sparkles, SquareTerminal, Bot, BookOpen, Settings } from "lucide-react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { CompanySettingsDialog } from "@/components/companysettingsdialog/companysettingsdialog";
import { useLanguage } from "@/hooks/use-language";
import { Company } from "@/lib/db/tables/company";
import { commonSettings } from "@/content/common";
import { showPricingDialog } from "@/hooks/use-subscription-dialog";
import { useSubscriptionAccess } from "@/hooks/use-subscription-access";

export function NavMain({
  currentCompany,
  userId,
}: {
  currentCompany: Company;
  userId: string;
}) {
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false);
  const { ttt } = useLanguage();

  const isB2B = commonSettings.subscriptionModel === "b2b";

  // Fetch real subscription data using the client-safe hook
  const { subscriptionAccess } = useSubscriptionAccess(userId, currentCompany.companyid);

  const isFreePlan = subscriptionAccess?.plan === 'free' || !subscriptionAccess;

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
      // Add upgrade button for B2B free plans
      ...(isB2B && isFreePlan ? [{
        title: ttt("Upgrade to Pro"),
        url: "#",
        icon: Sparkles,
        isUpgrade: true,
      }] : []),
    ],
  };
  const handleItemClick = (item: {
    title: string;
    url: string;
    isCompanySettings?: boolean;
    isUpgrade?: boolean;
  }) => {
    if (item.isCompanySettings) {
      setCompanySettingsOpen(true);
    } else if (item.isUpgrade) {
      showPricingDialog(userId, currentCompany.companyid);
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
          {data.navMain.map((item) => {
            // If it's a company settings or upgrade item, render as direct button
            if (item.isCompanySettings || item.isUpgrade || !item.items) {
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
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
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
        userId={userId}
      />
    </>
  );
}
