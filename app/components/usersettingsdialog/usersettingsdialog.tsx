"use client";

import {
  Settings,
  User,
} from "lucide-react";

import {
  SettingsDialog,
  type SettingsSection,
} from "@/components/ui/settings-dialog";
import { GeneralSettings } from "./settingsections/generalsettings";
import { useLanguage } from "@/hooks/use-language";
import { AccountSettings } from "./settingsections/accountsettings";

export function UserSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { ttt } = useLanguage();

  const sections: SettingsSection[] = [
    { name: ttt("General"), icon: Settings, component: <GeneralSettings /> },
    { name: ttt("Account"), icon: User, component: <AccountSettings /> },
  ];

  return (
    <SettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ttt("Settings")}
      description={ttt("Customize your settings here.")}
      sections={sections}
    />
  );
}
