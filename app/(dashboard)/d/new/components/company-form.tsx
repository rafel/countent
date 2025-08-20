"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { createCompanyAction, redirectToCompany } from "../functions/actions";
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/use-language";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { ttt } = useLanguage();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? ttt("Creating Company") : ttt("Create Company")}
    </Button>
  );
}

export function CompanyForm() {
  const [error, setError] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(false);
  const { ttt } = useLanguage();

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await createCompanyAction(formData);

    if (result.success && result.companyId) {
      // Redirect to the new company dashboard
      await redirectToCompany(result.companyId);
    } else {
      setError(ttt("An error occurred while creating the company"));
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <form action={handleAction} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>{ttt("Basic Information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{ttt("Company Name")} *</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgnumber">
                  {ttt("Organization Number")} *
                </Label>
                <Input
                  id="orgnumber"
                  name="orgnumber"
                  placeholder="556123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatnumber">
                  {ttt("VAT Registration Number")}
                </Label>
                <Input
                  id="vatnumber"
                  name="vatnumber"
                  placeholder="SE556123456701"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">{ttt("Company Type")} *</Label>
              <Select name="type" required>
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
                  <SelectItem value="EF">
                    {ttt("Sole Proprietorship")}
                  </SelectItem>
                  <SelectItem value="BRF">
                    {ttt("Housing Cooperative")}
                  </SelectItem>
                  <SelectItem value="EK">
                    {ttt("Economic Association")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information - Collapsible */}
        <Collapsible open={contactOpen} onOpenChange={setContactOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  {ttt("Contact Information (Optional)")}
                  {contactOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{ttt("Email")}</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{ttt("Phone")}</Label>
                    <Input id="phone" name="phone" type="tel" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactperson">{ttt("Contact Person")}</Label>
                  <Input id="contactperson" name="contactperson" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressline1">{ttt("Address")}</Label>
                  <Input id="addressline1" name="addressline1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressline2">{ttt("Address Line 2")}</Label>
                  <Input id="addressline2" name="addressline2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalcode">{ttt("Postal Code")}</Label>
                    <Input id="postalcode" name="postalcode" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{ttt("City")}</Label>
                    <Input id="city" name="city" />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Accounting Settings - Collapsible */}
        <Collapsible open={accountingOpen} onOpenChange={setAccountingOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  {ttt("Accounting Settings (Optional)")}
                  {accountingOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiscalyearstart">
                      {ttt("Fiscal Year Start")}
                    </Label>
                    <Input
                      id="fiscalyearstart"
                      name="fiscalyearstart"
                      type="date"
                      defaultValue={`${new Date().getFullYear()}-01-01`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscalyearend">
                      {ttt("Fiscal Year End")}
                    </Label>
                    <Input
                      id="fiscalyearend"
                      name="fiscalyearend"
                      type="date"
                      defaultValue={`${new Date().getFullYear()}-12-31`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{ttt("VAT Reporting Period")}</Label>
                  <Select name="vatreportingperiod">
                    <SelectTrigger>
                      <SelectValue
                        placeholder={ttt("Select VAT Reporting Period")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly">{ttt("Yearly")}</SelectItem>
                      <SelectItem value="quarterly">
                        {ttt("Quarterly")}
                      </SelectItem>
                      <SelectItem value="monthly">{ttt("Monthly")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{ttt("Accounting Method")}</Label>
                  <Select name="accountingmethod">
                    <SelectTrigger>
                      <SelectValue
                        placeholder={ttt("Select Accounting Method")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">
                        {ttt("Invoice Method")}
                      </SelectItem>
                      <SelectItem value="cash">{ttt("Cash Method")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasfirstannualreport"
                    name="hasfirstannualreport"
                  />
                  <Label htmlFor="hasfirstannualreport">
                    {ttt("Company has completed at least one annual report")}
                  </Label>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <SubmitButton />
      </form>
    </div>
  );
}
