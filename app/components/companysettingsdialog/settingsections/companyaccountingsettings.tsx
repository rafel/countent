"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/uselanguage";
import { updateCompany } from "../functions/actions";
import { Company } from "@/db/tables/company";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { ttt } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? ttt("Saving...") : ttt("Save Changes")}
    </Button>
  );
}

export function CompanyAccountingSettings({ company }: { company: Company }) {
  const { ttt } = useLanguage();
  const [formData, setFormData] = useState(company);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(submitData: FormData) {
    const data = {
      vatreportingperiod: submitData.get("vatreportingperiod") as string,
      accountingmethod: submitData.get("accountingmethod") as string,
      hasfirstannualreport: submitData.get("hasfirstannualreport") === "true",
    };

    try {
      const result = await updateCompany(company.companyid, data);
      if (result.success) {
        setFormData({ ...formData, ...data });
        setError(null);
      } else {
        setError(ttt("Failed to update company"));
      }
    } catch {
      setError(ttt("Failed to update company"));
    }
  }

  return (
    <div className="space-y-6 pt-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-6"
            onClick={() => setError(null)}
          >
            {ttt("Dismiss")}
          </Button>
        </div>
      )}

      <form action={handleSubmit} className="space-y-0">
        {/* VAT & Tax Settings */}
        <div className="pb-4">
          <h3 className="text-lg font-medium">{ttt("VAT & Tax Settings")}</h3>
          <p className="text-sm text-muted-foreground">
            {ttt("Configure VAT reporting and tax-related settings")}
          </p>
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="space-y-2">
            <Label htmlFor="vatreportingperiod">
              {ttt("VAT Reporting Period")}
            </Label>
            <Select
              name="vatreportingperiod"
              defaultValue={formData.vatreportingperiod || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={ttt("Select VAT Reporting Period")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">{ttt("Yearly")}</SelectItem>
                <SelectItem value="quarterly">{ttt("Quarterly")}</SelectItem>
                <SelectItem value="monthly">{ttt("Monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Accounting Method */}
        <div className="pt-6 pb-4">
          <h3 className="text-lg font-medium">{ttt("Accounting Method")}</h3>
          <p className="text-sm text-muted-foreground">
            {ttt("Choose the accounting method for your company")}
          </p>
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="space-y-2">
            <Label htmlFor="accountingmethod">{ttt("Accounting Method")}</Label>
            <Select
              name="accountingmethod"
              defaultValue={formData.accountingmethod || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder={ttt("Select Accounting Method")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice">{ttt("Invoice Method")}</SelectItem>
                <SelectItem value="cash">{ttt("Cash Method")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Annual Report Status */}
        <div className="pt-6 pb-4">
          <h3 className="text-lg font-medium">{ttt("Annual Report Status")}</h3>
          <p className="text-sm text-muted-foreground">
            {ttt("Information about your company's annual reporting status")}
          </p>
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasfirstannualreport"
              name="hasfirstannualreport"
              value="true"
              defaultChecked={formData.hasfirstannualreport || false}
            />
            <Label
              htmlFor="hasfirstannualreport"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {ttt("Company has completed at least one annual report")}
            </Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            {ttt("Check this if your company has already filed at least one annual report")}
          </p>
        </div>

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
