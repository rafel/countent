import { getUser } from "@/lib/user";
import { getPendingInvitesForUser } from "@/app/d/invites/actions";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/lib/db/queries/workspace";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const pendingInvites = await getPendingInvitesForUser(user.email);

  if (pendingInvites && pendingInvites.length > 0) {
    redirect("/d/invites");
  }

  const workspaces = await getUserWorkspaces(user.userid);

  // If user has no workspaces, redirect to new workspace creation
  if (!workspaces || workspaces.length === 0) {
    redirect("/d/new");
  }

  // If user has workspaces, redirect to the first workspace's dashboard
  const firstWorkspace = workspaces[0];
  redirect(`/d/${firstWorkspace.workspace.workspaceid}`);
}
