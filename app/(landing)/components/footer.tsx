"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { ChevronDown, Globe, Palette } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { LANGUAGES, useLanguageContext } from "@/app/contexts/languageprovider";
import { useLanguage } from "@/hooks/uselanguage";
import { commonSettings } from "@/content/common";

export function Footer() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const { language, setLanguage } = useLanguageContext();
  const { ttt } = useLanguage();
  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);

    if (session?.user) {
      try {
        await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch (error) {
        console.error("Failed to sync theme to database:", error);
      }
    }
  };

  const handleLanguageChange = async (newLanguage: "en" | "sv") => {
    await setLanguage(newLanguage);
  };

  const currentLanguage = LANGUAGES.find((lang) => lang.id === language);
  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return ttt("Light");
      case "dark":
        return ttt("Dark");
      default:
        return ttt("System");
    }
  };

  return (
    <footer className="container-full  px-4 pt-[calc(var(--navbar-height)+32px)] text-brand-white dark:text-brand-black md:px-6 lg:pt-[calc(var(--navbar-height)+48px)] mb-0 pb-0">
      <div className="relative flex flex-col justify-start mx-auto gap-4 pt-12 h-full max-w-[1600px] overflow-hidden rounded-t-2xl text-center md:justify-between md:gap-6 border-2 border-b-0">
        <div className="mx-auto box-border max-w-[1600px] px-6 md:px-9">
          <div className="flex flex-col gap-8 py-10">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src={
                  resolvedTheme === "dark"
                    ? commonSettings.LogoDark
                    : commonSettings.Logo
                }
                alt={ttt("ServiceName")}
                width={100}
                height={100}
              />
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {/* Product */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">
                  {ttt("Features")}
                </h3>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <Link
                    href="/features"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Features")}
                  </Link>
                  <Link
                    href="/pricing"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Pricing")}
                  </Link>
                  <Link
                    href="/blog"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Blog")}
                  </Link>
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">
                  {ttt("Enterprise")}
                </h3>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <Link
                    href="/enterprise"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Enterprise")}
                  </Link>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Privacy Policy")}
                  </Link>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Terms of Service")}
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">
                  {ttt("Documentation")}
                </h3>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <Link
                    href="/docs"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Documentation")}
                  </Link>
                  <Link
                    href="/tutorials"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Tutorials")}
                  </Link>
                  <Link
                    href="/changelog"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Changelog")}
                  </Link>
                </div>
              </div>

              {/* Account */}
              <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-foreground">
                  {ttt("Account")}
                </h3>
                <div className="flex flex-col gap-2 text-muted-foreground">
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Login")}
                  </Link>
                  <Link
                    href="/login"
                    className="hover:text-foreground transition-colors"
                  >
                    {ttt("Sign up")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
              {/* Theme and Language Controls */}
              <div className="flex items-center gap-4">
                {/* Theme Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Palette className="h-4 w-4" />
                      {getThemeLabel()}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() => handleThemeChange("light")}
                    >
                      {ttt("Light")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                      {ttt("Dark")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleThemeChange("system")}
                    >
                      {ttt("System")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Language Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Globe className="h-4 w-4" />
                      {currentLanguage?.title || "English"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem
                        key={lang.id}
                        onClick={() => handleLanguageChange(lang.id)}
                        className={language === lang.id ? "bg-accent" : ""}
                      >
                        {lang.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Copyright */}
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {ttt("ServiceName")}.{" "}
                {ttt("All rights reserved")}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
