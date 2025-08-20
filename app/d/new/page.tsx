"use client";

import { CompanyForm } from "./components/company-form";
import { useLanguage } from "@/hooks/use-language";
import { useEffect, useState } from "react";
import { checkUserHasCompanies } from "./functions/actions";

export default function New() {
  const { ttt } = useLanguage();
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);

  useEffect(() => {
    async function fetchCompanyStatus() {
      try {
        const userHasCompanies = await checkUserHasCompanies();
        setHasCompany(userHasCompanies);
      } catch (error) {
        console.error("Error checking company status:", error);
        setHasCompany(false); // Default to false on error
      }
    }

    fetchCompanyStatus();
  }, []);

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        <div className="px-4 sm:px-0">
          <h1 className="text-3xl font-bold">
            {hasCompany === null 
              ? ttt("Create Company") // Loading state
              : hasCompany
              ? ttt("Create a new company")
              : ttt("Create your first company")}
          </h1>
          <p className="text-muted-foreground">
            {ttt(
              "Fill in the company information to get started with your accounting"
            )}
          </p>
        </div>
        <CompanyForm />
      </div>
    </div>
  );
}
