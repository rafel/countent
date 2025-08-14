"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb";
import { useLanguage } from "@/hooks/uselanguage";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isLast?: boolean;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { ttt } = useLanguage();

  // Define breadcrumb configurations for specific routes
  const getBreadcrumbConfig = (path: string): BreadcrumbItem[] => {
    switch (path) {
      case "/dashboard":
        return [{ label: ttt("Dashboard"), isLast: true }];

      case "/dashboard/page1":
        return [
          { label: ttt("Dashboard"), href: "/dashboard" },
          { label: ttt("Page 1"), isLast: true },
        ];

      case "/dashboard/page2":
        return [
          { label: ttt("Dashboard"), href: "/dashboard" },
          { label: ttt("Page 2"), isLast: true },
        ];

      case "/dashboard/settings":
        return [
          { label: ttt("Dashboard"), href: "/dashboard" },
          { label: ttt("Settings"), isLast: true },
        ];

      case "/dashboard/settings/profile":
        return [
          { label: ttt("Dashboard"), href: "/dashboard" },
          { label: ttt("Settings"), href: "/dashboard/settings" },
          { label: ttt("Profile"), isLast: true },
        ];

      case "/dashboard/users":
        return [
          { label: ttt("Dashboard"), href: "/dashboard" },
          { label: ttt("Users"), isLast: true },
        ];

      case "/dashboard/projects":
        return [
          { label: ttt("Dashboard"), href: "/dashboard" },
          { label: ttt("Projects"), isLast: true },
        ];

      default:
        return [{ label: ttt("Dashboard"), isLast: true, href: "/dashboard" }];
    }
  };

  const breadcrumbItems = getBreadcrumbConfig(pathname);

  if (breadcrumbItems.length <= 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href!}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
