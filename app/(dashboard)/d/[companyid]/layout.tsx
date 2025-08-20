import { getUser } from "@/lib/db/queries/user";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/app/components/sidebar/sidebar";
import { Header } from "@/app/components/sidebar/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/app/contexts/dashboardproviders";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { getUserCompanies } from "./functions/actions";

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
  const hasAccessToCompany = companies.some(
    (company) => company.companyid === companyid
  );

  if (!hasAccessToCompany) {
    // User doesn't have access to this company, redirect to dashboard flow
    redirect("/d");
  }

  return (
    <DashboardProviders>
      <DataStreamProvider>
        <SidebarProvider>
          <AppSidebar
            user={user}
            currentCompanyId={companyid}
            companies={companies}
          />
          <SidebarInset>
            <Header />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </DataStreamProvider>
    </DashboardProviders>
  );
}
