import { getUser } from "@/lib/user";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardProviders } from "@/contexts/dashboardproviders";
import { WorkspaceProvider } from "@/contexts/workspaceprovider";
import {
  getUserWorkspaces,
  getWorkspaceForUser,
} from "@/lib/db/queries/workspace";

export default async function HomeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceid: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const { workspaceid } = await params;

  const workspace = await getWorkspaceForUser(user.userid, workspaceid);

  if (!workspace) {
    redirect("/d");
  }

  const workspaces = await getUserWorkspaces(user.userid);

  return (
    <WorkspaceProvider initialData={workspace}>
      <DashboardProviders user={user}>
        <SidebarProvider>
          <AppSidebar
            user={user}
            workspaces={workspaces.map((w) => w.workspace)}
            workspaceid={workspaceid}
          />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </DashboardProviders>
    </WorkspaceProvider>
  );
}
