import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/app/contexts/dashboardproviders";
import { getUserCompanies } from "./actions";

export default async function HomeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyid: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const { companyid } = await params;

  const companies = await getUserCompanies(user.userid);
  
  // Check if user has access to this specific company
  const hasAccessToCompany = companies.some(company => company.companyid === companyid);
  
  if (!hasAccessToCompany) {
    // User doesn't have access to this company, redirect to dashboard flow
    redirect("/d");
  }

  return (
    <DashboardProviders>
      <SidebarProvider>
        <AppSidebar
          user={user}
          currentCompanyId={companyid}
          companies={companies}
        />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </DashboardProviders>
  );
}
