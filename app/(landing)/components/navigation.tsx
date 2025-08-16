"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/hooks/uselanguage";
import { useIsMobile } from "@/hooks/usemobile";
import { useTheme } from "next-themes";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/app/components/ui/sidebar";
import { commonSettings } from "@/content/common";

export function Navigation() {
  const { ttt } = useLanguage();
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  return (
    <nav className="fixed top-4 z-[9999] w-full lg:top-6">
      <div className="mx-auto box-border max-w-[1600px] px-6 md:px-9">
        <div className="relative flex h-[var(--navbar-height)] w-full items-center justify-between rounded-lg border border-transparent bg-background px-4 py-2">
          <Link
            aria-label={ttt("ServiceName")}
            className="relative flex w-fit items-center gap-0.5 overflow-hidden"
            href="/"
          >
            <div className="rounded-lg p-1">
              <Image
                alt=""
                width={32}
                height={32}
                decoding="async"
                src={
                  resolvedTheme === "dark"
                    ? commonSettings.LogoDark
                    : commonSettings.Logo
                }
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="flex items-center gap-8">
            <ul className="gap-5 px-2 font-medium text-muted-foreground xl:gap-6 hidden lg:flex">
              <li>
                <Link href="/features">{ttt("Features")}</Link>
              </li>
              <li>
                <Link href="/pricing">{ttt("Pricing")}</Link>
              </li>
            </ul>

            <div className="col-start-3 hidden w-full justify-end gap-2 lg:flex">
              <Link href="/login">
                <Button variant="outline" className="cursor-pointer" size="lg">
                  {ttt("Login")}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="default" className="cursor-pointer" size="lg">
                  {ttt("Get Started")}
                </Button>
              </Link>
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              >
                <Menu className="h-8 w-8" />
                <span className="sr-only">{ttt("Open menu")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay - Following UserSettings Pattern */}
      {mobileSidebarOpen && isMobile && (
        <SidebarProvider>
          <div className="fixed inset-0 z-[10000] lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar */}
            <Sidebar
              collapsible="none"
              className="absolute right-0 top-0 h-full w-72 flex"
            >
              <SidebarContent>
                <SidebarHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div></div>
                    <Button
                      variant="ghost"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="h-8 w-8"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </SidebarHeader>

                <div className="px-6">
                  {/* Navigation Links */}
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        <Link href="/features">
                          <span>{ttt("Features")}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        size="lg"
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        <Link href="/pricing">
                          <span>{ttt("Pricing")}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  <SidebarSeparator className="my-6" />

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        size="lg"
                      >
                        {ttt("Login")}
                      </Button>
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileSidebarOpen(false)}
                    >
                      <Button
                        variant="default"
                        className="w-full justify-center"
                        size="lg"
                      >
                        {ttt("Get Started")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </SidebarContent>
            </Sidebar>
          </div>
        </SidebarProvider>
      )}
    </nav>
  );
}
