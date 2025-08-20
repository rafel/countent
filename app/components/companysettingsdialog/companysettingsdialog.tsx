"use client";

import {
  Settings,
  Phone,
  Calendar,
  Users,
  AlertTriangle,
} from "lucide-react";

import { SettingsDialog, type SettingsSection } from "@/components/ui/settings-dialog";
import { CompanyGeneralSettings } from "./settingsections/companygeneralsettings";
import { CompanyContactInfo } from "./settingsections/companycontactinfo";
import { CompanyAccountingSettings } from "./settingsections/companyaccountingsettings";
import { CompanyTeam } from "./settingsections/companyteam";
import { CompanyDangerZone } from "./settingsections/companydangerzone";
import { useLanguage } from "@/hooks/use-language";
import type { Company } from "@/lib/db/tables/company";

export function CompanySettingsDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}) {
  const { ttt } = useLanguage();

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
    { 
      name: ttt("Companies"), 
      icon: AlertTriangle,
      component: <CompanyDangerZone company={company} />,
    },
  ];

  return (
    <SettingsDialog
      open={open}
      onOpenChange={onOpenChange}
      title={ttt("Company Settings")}
      description={`${ttt("Customize your company settings here.")}`}
      sections={sections}
      mobileFullHeight={true}
    />
  );
}
