import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";
import { InviteAcceptance } from "./components/invite-acceptance";
import { getPendingInvitesForUser } from "./functions/actions";

export default async function InvitesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // Get pending invites for this user
  const pendingInvites = await getPendingInvitesForUser(user.email);

  // If no pending invites, redirect to normal dashboard flow
  if (!pendingInvites || pendingInvites.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <InviteAcceptance invites={pendingInvites} />
    </div>
  );
}
