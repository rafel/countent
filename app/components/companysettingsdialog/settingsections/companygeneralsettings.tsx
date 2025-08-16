"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useLanguage } from "@/hooks/uselanguage";
import { getCompanyById, updateCompany } from "../functions/actions";

export function CompanyGeneralSettings({ companyId }: { companyId: string }) {
  const { ttt } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    orgnumber: "",
    type: "",
    vatnumber: "",
    email: "",
    phone: "",
    contactperson: "",
    addressline1: "",
    addressline2: "",
    postalcode: "",
    city: "",
    fiscalyearstart: "",
    fiscalyearend: "",
    vatreportingperiod: "",
    accountingmethod: "",
    hasfirstannualreport: false,
  });

  // Fetch company data when companyId changes
  useEffect(() => {
    async function fetchCompanyData() {
      if (companyId) {
        setIsLoading(true);
        setError(null);
        try {
          const company = await getCompanyById(companyId);
          if (company) {
            setCompanyData({
              name: company.name || "",
              orgnumber: company.orgnumber || "",
              type: company.type || "",
              vatnumber: company.vatnumber || "",
              email: company.email || "",
              phone: company.phone || "",
              contactperson: company.contactperson || "",
              addressline1: company.addressline1 || "",
              addressline2: company.addressline2 || "",
              postalcode: company.postalcode || "",
              city: company.city || "",
              fiscalyearstart: company.fiscalyearstart || "",
              fiscalyearend: company.fiscalyearend || "",
              vatreportingperiod: company.vatreportingperiod || "",
              accountingmethod: company.accountingmethod || "",
              hasfirstannualreport: company.hasfirstannualreport || false,
            });
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
          setError(ttt("Failed to load company data"));
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchCompanyData();
  }, [companyId, ttt]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await updateCompany(companyId, companyData);
      if (!result.success) {
        setError(ttt("Failed to save company data"));
      }
    } catch (error) {
      console.error("Error saving company data:", error);
      setError(ttt("Failed to save company data"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">{ttt("Loading company data...")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>{ttt("Basic Information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">{ttt("Company Name")} *</Label>
            <Input
              id="company-name"
              value={companyData.name}
              onChange={(e) =>
                setCompanyData({ ...companyData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-number">{ttt("Organization Number")} *</Label>
              <Input
                id="org-number"
                value={companyData.orgnumber}
                onChange={(e) =>
                  setCompanyData({ ...companyData, orgnumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat-number">
                {ttt("VAT Registration Number")}
              </Label>
              <Input
                id="vat-number"
                value={companyData.vatnumber}
                onChange={(e) =>
                  setCompanyData({ ...companyData, vatnumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-type">{ttt("Company Type")} *</Label>
            <Select
              value={companyData.type}
              onValueChange={(value) =>
                setCompanyData({ ...companyData, type: value })
              }
            >
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
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>{ttt("Contact Information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-email">{ttt("Email")}</Label>
              <Input
                id="company-email"
                type="email"
                value={companyData.email}
                onChange={(e) =>
                  setCompanyData({ ...companyData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">{ttt("Phone")}</Label>
              <Input
                id="company-phone"
                value={companyData.phone}
                onChange={(e) =>
                  setCompanyData({ ...companyData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-person">{ttt("Contact Person")}</Label>
            <Input
              id="contact-person"
              value={companyData.contactperson}
              onChange={(e) =>
                setCompanyData({
                  ...companyData,
                  contactperson: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1">{ttt("Address")}</Label>
            <Input
              id="address1"
              value={companyData.addressline1}
              onChange={(e) =>
                setCompanyData({ ...companyData, addressline1: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2">{ttt("Address Line 2")}</Label>
            <Input
              id="address2"
              value={companyData.addressline2}
              onChange={(e) =>
                setCompanyData({ ...companyData, addressline2: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal-code">{ttt("Postal Code")}</Label>
              <Input
                id="postal-code"
                value={companyData.postalcode}
                onChange={(e) =>
                  setCompanyData({ ...companyData, postalcode: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{ttt("City")}</Label>
              <Input
                id="city"
                value={companyData.city}
                onChange={(e) =>
                  setCompanyData({ ...companyData, city: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounting Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{ttt("Accounting Settings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiscal-year-start">{ttt("Fiscal Year Start")}</Label>
              <Input
                id="fiscal-year-start"
                type="date"
                value={companyData.fiscalyearstart}
                onChange={(e) =>
                  setCompanyData({ ...companyData, fiscalyearstart: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscal-year-end">{ttt("Fiscal Year End")}</Label>
              <Input
                id="fiscal-year-end"
                type="date"
                value={companyData.fiscalyearend}
                onChange={(e) =>
                  setCompanyData({ ...companyData, fiscalyearend: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-reporting-period">{ttt("VAT Reporting Period")}</Label>
            <Select
              value={companyData.vatreportingperiod}
              onValueChange={(value) =>
                setCompanyData({ ...companyData, vatreportingperiod: value })
              }
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

          <div className="space-y-2">
            <Label htmlFor="accounting-method">{ttt("Accounting Method")}</Label>
            <Select
              value={companyData.accountingmethod}
              onValueChange={(value) =>
                setCompanyData({ ...companyData, accountingmethod: value })
              }
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="first-annual-report"
              checked={companyData.hasfirstannualreport}
              onCheckedChange={(checked) =>
                setCompanyData({ ...companyData, hasfirstannualreport: !!checked })
              }
            />
            <Label htmlFor="first-annual-report">
              {ttt("Company has completed at least one annual report")}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? ttt("Saving...") : ttt("Save Changes")}
        </Button>
      </div>
    </div>
  );
}
