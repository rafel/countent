import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/app/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/app/components/ui/sidebar";
import { DashboardProviders } from "@/app/contexts/dashboardproviders";
import { getUserCompanies } from "./functions/actions";
import { getCompanyChats } from "@/utils/chat";

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
    redirect("/dashboard");
  }

  // Get chats for this company
  const chats = await getCompanyChats(companyid, user.userid);

  return (
    <DashboardProviders>
      <SidebarProvider>
        <AppSidebar
          user={user}
          currentCompanyId={companyid}
          companies={companies}
          chats={chats}
        />
        <SidebarInset className="bg-muted/30">
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 relative">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProviders>
  );
}
