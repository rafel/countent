"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useLanguageContext, LANGUAGES } from "@/app/contexts/languageprovider";
import { useLanguage } from "@/hooks/uselanguage";

export function LanguageSelect() {
  const { language, setLanguage } = useLanguageContext();
  const { ttt } = useLanguage();

  const handleLanguageChange = async (newLanguage: "en" | "sv") => {
    await setLanguage(newLanguage);
  };

  const currentLanguage = LANGUAGES.find((lang) => lang.id === language);
  console.log(currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{ttt("Select language")}</span>
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
  );
}
