"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/use-language";
import { updateCompany } from "../functions/actions";
import type { Company } from "@/lib/db/tables/company";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export function CompanyContactInfo({ company }: { company: Company }) {
  const { ttt } = useLanguage();
  const [formData, setFormData] = useState(company);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(submitData: FormData) {
    const data = {
      addressline1: submitData.get("addressline1") as string,
      addressline2: submitData.get("addressline2") as string,
      postalcode: submitData.get("postalcode") as string,
      city: submitData.get("city") as string,
      phone: submitData.get("phone") as string,
      email: submitData.get("email") as string,
      contactperson: submitData.get("contactperson") as string,
    };

    try {
      const result = await updateCompany(company.companyid, data);
      if (result.success) {
        setFormData({ ...formData, ...data });
        setError(null);
      } else {
        setError(ttt("Something went wrong, please contact support"));
      }
    } catch {
      setError(ttt("Something went wrong, please contact support"));
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
        {/* Address Information */}
        <div className="pb-4">
          <h3 className="text-lg font-medium">{ttt("Address Information")}</h3>
          <p className="text-sm text-muted-foreground">
            {ttt("Company physical address and location details")}
          </p>
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="space-y-2">
            <Label htmlFor="addressline1">{ttt("Address")}</Label>
            <Input
              id="addressline1"
              name="addressline1"
              defaultValue={formData.addressline1 || ""}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalcode">{ttt("Postal Code")}</Label>
              <Input
                id="postalcode"
                name="postalcode"
                defaultValue={formData.postalcode || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{ttt("City")}</Label>
              <Input id="city" name="city" defaultValue={formData.city || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressline2">{ttt("Address Line 2")}</Label>
            <Input
              id="addressline2"
              name="addressline2"
              placeholder={ttt("Apartment, suite, etc. (optional)")}
              defaultValue={formData.addressline2 || ""}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-6 pb-4">
          <h3 className="text-lg font-medium">{ttt("Contact Information")}</h3>
          <p className="text-sm text-muted-foreground">
            {ttt("Phone, email, and contact person details")}
          </p>
        </div>

        <div className="space-y-4 border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{ttt("Email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={formData.email || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{ttt("Phone")}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={formData.phone || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactperson">{ttt("Contact Person")}</Label>
            <Input
              id="contactperson"
              name="contactperson"
              defaultValue={formData.contactperson || ""}
            />
          </div>
        </div>

        <div className="pt-6">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
