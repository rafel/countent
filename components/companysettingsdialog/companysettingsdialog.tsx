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

import { SettingsDialog, SettingsSection } from "@/components/ui/settings-dialog";
import { CompanyGeneralSettings } from "./settingsections/companygeneralsettings";
import { CompanyContactInfo } from "./settingsections/companycontactinfo";
import { CompanyAccountingSettings } from "./settingsections/companyaccountingsettings";
import { CompanyTeam } from "./settingsections/companyteam";
import { CompanyDangerZone } from "./settingsections/companydangerzone";
import { SubscriptionBillingSection } from "@/components/shared/subscription-billing-section";
import { useLanguage } from "@/hooks/use-language";
import { useSubscriptionDialog } from "@/hooks/use-subscription-dialog";
import { Company } from "@/lib/db/tables/company";
import { commonSettings } from "@/content/common";

export function CompanySettingsDialog({
  open,
  onOpenChange,
  company,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
  userId: string;
}) {
  const { ttt } = useLanguage();
  const { currentDialog, closeDialog } = useSubscriptionDialog();

  // Check if we should show billing section in company dialog
  const showBillingInCompany = commonSettings.subscriptionModel === "b2b";

  const sections: SettingsSection[] = [
    {
      name: ttt("General"),
      icon: Settings,
      component: <CompanyGeneralSettings company={company} />,
    },
    { 
      name: ttt("Contact Information"), 
      icon: Phone,
      component: <CompanyContactInfo company={company} />,
    },
    { 
      name: ttt("Accounting Settings"), 
      icon: Calendar,
      component: <CompanyAccountingSettings company={company} />,
    },
    { 
      name: ttt("Team"), 
      icon: Users,
      component: <CompanyTeam companyId={company.companyid} />,
    },
    // Conditionally add billing section for B2B model
    ...(showBillingInCompany ? [{
      name: ttt("Billing & Subscription"),
      icon: CreditCard,
      component: (
        <SubscriptionBillingSection 
          userId={userId}
          companyId={company.companyid}
          isCompanyContext={true}
        />
      ),
    }] : []),
    { 
      name: ttt("Companies"), 
      icon: AlertTriangle,
      component: <CompanyDangerZone company={company} />,
    },
  ];

  // Handle subscription dialog integration
  React.useEffect(() => {
    if (currentDialog?.type === "company" && !open) {
      onOpenChange(true);
    }
  }, [currentDialog, open, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && currentDialog?.type === "company") {
      closeDialog();
    }
    onOpenChange(newOpen);
  };

  // Determine initial section based on dialog target
  const getInitialSection = () => {
    if (currentDialog?.type === "company" && showBillingInCompany) {
      switch (currentDialog.target) {
        case "billing":
        case "usage":
        case "plans":
        case "history":
          return sections.find(s => s.name === ttt("Billing & Subscription"));
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
      title={ttt("Company Settings")}
      description={`${ttt("Customize your company settings here.")}`}
      sections={sections}
      mobileFullHeight={true}
      defaultSection={getInitialSection()}
    />
  );
}
