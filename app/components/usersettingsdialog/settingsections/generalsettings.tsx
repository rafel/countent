"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { LANGUAGES, useLanguageContext } from "@/app/contexts/languageprovider";
import { useLanguage } from "@/hooks/uselanguage";

export function GeneralSettings() {
  const { setTheme, theme } = useTheme();
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
        return "light";
    }
  };

  return (
    <div className="space-y-0">
      {/* Theme Setting */}
      <div className="flex items-center justify-between py-4 border-b border-border/50">
        <span className="text-sm font-medium">{ttt("Toggle theme")}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-w-[100px] justify-between"
            >
              {getThemeLabel()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleThemeChange("light")}>
              {ttt("Light")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
              {ttt("Dark")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Language Setting */}
      <div className="flex items-center justify-between py-4 border-b border-border/50">
        <span className="text-sm font-medium">{ttt("Select language")}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-w-[100px] justify-between"
            >
              {currentLanguage?.title || "English"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
    </div>
  );
}
