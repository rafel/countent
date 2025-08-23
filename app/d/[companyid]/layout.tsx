import { getUser } from "@/lib/user";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/contexts/dashboardproviders";
import { getUserCompanies } from "./actions";
import { SubscriptionProvider } from "@/contexts/subscriptionprovider";
import { checkSubscriptionAccess } from "@/lib/db/queries/subscription";

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

  const initialSubscriptionData = await checkSubscriptionAccess(
    user.userid,
    companyid
  );

  return (
    <SubscriptionProvider
      userId={user.userid}
      companyId={companyid}
      initialData={initialSubscriptionData}
    >
      <DashboardProviders>
        <SidebarProvider>
          <AppSidebar
            user={user}
            currentCompanyId={companyid}
            companies={companies}
          />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </DashboardProviders>
    </SubscriptionProvider>
  );
}
