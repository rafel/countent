"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/use-language";
import { updateCompany } from "../functions/actions";
import type { Company } from "@/lib/db/tables/company";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { ttt } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? ttt("Saving...") : ttt("Save Changes")}
    </Button>
  );
}

export function CompanyGeneralSettings({ company }: { company: Company }) {
  const { ttt } = useLanguage();
  const [formData, setFormData] = useState(company);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(submitData: FormData) {
    const data = {
      name: submitData.get("name") as string,
      orgnumber: submitData.get("orgnumber") as string,
      type: submitData.get("type") as string,
    };

    try {
      const result = await updateCompany(company.companyid, data);
      if (result.success) {
        setFormData({ ...formData, ...data });
        setError(null);
      } else {
        setError(ttt("Failed to save company data"));
      }
    } catch {
      setError(ttt("Failed to save company data"));
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
        {/* Basic Information */}
        <div className="pb-4">
          <h3 className="text-lg font-medium">{ttt("Basic Information")}</h3>
          <p className="text-sm text-muted-foreground">
            {ttt("Essential company details and registration information")}
          </p>
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="space-y-2">
            <Label htmlFor="name">{ttt("Company Name")} *</Label>
            <Input
              id="name"
              name="name"
              placeholder={ttt("Enter company name")}
              defaultValue={formData.name || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgnumber">{ttt("Organization Number")} *</Label>
            <Input
              id="orgnumber"
              name="orgnumber"
              placeholder={ttt("Enter organization number")}
              defaultValue={formData.orgnumber || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{ttt("Company Type")} *</Label>
            <Select name="type" defaultValue={formData.type || ""}>
              <SelectTrigger>
                <SelectValue placeholder={ttt("Select Company Type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AB">
                  {ttt("Limited Company")} (AB)
                </SelectItem>
                <SelectItem value="HB">
                  {ttt("General Partnership")} (HB)
                </SelectItem>
                <SelectItem value="KB">
                  {ttt("Limited Partnership")} (KB)
                </SelectItem>
                <SelectItem value="EF">{ttt("Sole Proprietorship")}</SelectItem>
                <SelectItem value="BRF">
                  {ttt("Housing Cooperative")}
                </SelectItem>
                <SelectItem value="EK">
                  {ttt("Economic Association")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
