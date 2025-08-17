"use client";

import * as React from "react";
import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  Menu,
  MessageCircle,
  Paintbrush,
  Settings,
  Video,
} from "lucide-react";

import {
  SettingsDialog,
  SettingsSection,
} from "@/app/components/ui/settings-dialog";
import { GeneralSettings } from "./settingsections/generalsettings";
import { useLanguage } from "@/hooks/uselanguage";

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
    { name: ttt("Notifications"), icon: Bell },
    { name: ttt("Navigation"), icon: Menu },
    { name: ttt("Home"), icon: Home },
    { name: ttt("Appearance"), icon: Paintbrush },
    { name: ttt("Messages & media"), icon: MessageCircle },
    { name: ttt("Language & region"), icon: Globe },
    { name: ttt("Accessibility"), icon: Keyboard },
    { name: ttt("Mark as read"), icon: Check },
    { name: ttt("Audio & video"), icon: Video },
    { name: ttt("Connected accounts"), icon: Link },
    { name: ttt("Privacy & visibility"), icon: Lock },
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
