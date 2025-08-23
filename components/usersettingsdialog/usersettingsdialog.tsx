"use client";

import * as React from "react";
import { Settings, User, CreditCard } from "lucide-react";

import {
  SettingsDialog,
  SettingsSection,
} from "@/components/ui/settings-dialog";
import { GeneralSettings } from "./settingsections/generalsettings";
import { AccountSettings } from "./settingsections/accountsettings";
import { SubscriptionBillingSection } from "@/components/shared/subscription-billing-section";
import { useLanguage } from "@/hooks/use-language";
import { useSubscriptionDialog } from "@/hooks/use-subscription-dialog";
import { commonSettings } from "@/content/common";

export function UserSettingsDialog({
  open,
  onOpenChange,
  workspaceid,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceid: string;
}) {
  const { ttt } = useLanguage();
  const { currentDialog, closeDialog } = useSubscriptionDialog();

  // Check if we should show billing section in user dialog
  const showBillingInUser = commonSettings.subscriptionModel === "b2c";

  const sections: SettingsSection[] = [
    { name: ttt("General"), icon: Settings, component: <GeneralSettings /> },
    { name: ttt("Account"), icon: User, component: <AccountSettings /> },
    // Conditionally add billing section for B2C model
    ...(showBillingInUser
      ? [
          {
            name: ttt("Billing & Subscription"),
            icon: CreditCard,
            component: (
              <SubscriptionBillingSection
                workspaceid={workspaceid}
                isWorkspaceContext={true}
              />
            ),
          },
        ]
      : []),
  ];

  // Handle subscription dialog integration
  React.useEffect(() => {
    if (currentDialog?.type === "user" && !open) {
      onOpenChange(true);
    }
  }, [currentDialog, open, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && currentDialog?.type === "user") {
      closeDialog();
    }
    onOpenChange(newOpen);
  };

  // Determine initial section based on dialog target
  const getInitialSection = () => {
    if (currentDialog?.type === "user" && showBillingInUser) {
      switch (currentDialog.target) {
        case "billing":
        case "usage":
        case "plans":
        case "history":
          return sections.find((s) => s.name === ttt("Billing & Subscription"));
        default:
          return undefined;
      }
    }
    return undefined;
  };

  return (
    <SettingsDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={ttt("Settings")}
      description={ttt("Customize your settings here.")}
      sections={sections}
      defaultSection={getInitialSection()}
    />
  );
}
