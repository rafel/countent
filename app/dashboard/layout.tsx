import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/app/components/sidebar/sidebar";
import { Header } from "@/app/components/sidebar/header";
import { SidebarInset, SidebarProvider } from "@/app/components/ui/sidebar";
import { DashboardProviders } from "@/app/contexts/dashboardproviders";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardProviders>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProviders>
  );
}
