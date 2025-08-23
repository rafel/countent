"use client";

import * as React from "react";
import {
  Settings,
  Phone,
  Calendar,
  Users,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

import {
  SettingsDialog,
  SettingsSection,
} from "@/components/ui/settings-dialog";
import { WorkspaceGeneralSettings } from "./settingsections/workspacegeneralsettings";
import { WorkspaceContactInfo } from "./settingsections/workspacecontactinfo";
import { WorkspaceAccountingSettings } from "./settingsections/workspaceaccountingsettings";
import { WorkspaceTeam } from "./settingsections/workspaceteam";
import { WorkspaceDangerZone } from "./settingsections/workspacedangerzone";
import { SubscriptionBillingSection } from "@/components/shared/subscription-billing-section";
import { useLanguage } from "@/hooks/use-language";
import { useSubscriptionDialog } from "@/hooks/use-subscription-dialog";
import { Workspace } from "@/lib/db/tables/workspace";
import { commonSettings } from "@/content/common";

export function WorkspaceSettingsDialog({
  open,
  onOpenChange,
  workspace,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}) {
  const { ttt } = useLanguage();
  const { currentDialog, closeDialog } = useSubscriptionDialog();

  // Check if we should show billing section in company dialog
  const showBillingInWorkspace = commonSettings.subscriptionModel === "b2b";

  const sections: SettingsSection[] = [
    {
      name: ttt("General"),
      icon: Settings,
      component: <WorkspaceGeneralSettings workspace={workspace} />,
    },
    {
      name: ttt("Contact Information"),
      icon: Phone,
      component: <WorkspaceContactInfo workspace={workspace} />,
    },
    {
      name: ttt("Accounting Settings"),
      icon: Calendar,
      component: <WorkspaceAccountingSettings workspace={workspace} />,
    },
    {
      name: ttt("Team"),
      icon: Users,
      component: <WorkspaceTeam workspaceId={workspace.workspaceid} />,
    },
    // Conditionally add billing section for B2B model
    ...(showBillingInWorkspace
      ? [
          {
            name: ttt("Billing & Subscription"),
            icon: CreditCard,
            component: (
              <SubscriptionBillingSection
                workspaceid={workspace.workspaceid}
                isWorkspaceContext={true}
              />
            ),
          },
        ]
      : []),
    {
      name: ttt("Danger Zone"),
      icon: AlertTriangle,
      component: <WorkspaceDangerZone workspace={workspace} />,
    },
  ];

  // Handle subscription dialog integration
  React.useEffect(() => {
    if (currentDialog?.type === "workspace" && !open) {
      onOpenChange(true);
    }
  }, [currentDialog, open, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && currentDialog?.type === "workspace") {
      closeDialog();
    }
    onOpenChange(newOpen);
  };

  // Determine initial section based on dialog target
  const getInitialSection = () => {
    if (currentDialog?.type === "workspace" && showBillingInWorkspace) {
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
      title={ttt("Workspace Settings")}
      description={`${ttt("Customize your workspace settings here.")}`}
      sections={sections}
      mobileFullHeight={true}
      defaultSection={getInitialSection()}
    />
  );
}
