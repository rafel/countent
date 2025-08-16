import { getUser } from "@/utils/user";
import { getUserCompanies } from "@/app/(dashboard)/dashboard/[companyid]/functions/actions";
import { getPendingInvitesForUser } from "@/app/(dashboard)/dashboard/invites/functions/actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Check for pending invites first
  const pendingInvites = await getPendingInvitesForUser(user.email);
  
  // If user has pending invites, redirect to invites page
  if (pendingInvites && pendingInvites.length > 0) {
    redirect("/dashboard/invites");
  }

  const userCompanies = await getUserCompanies(user.userid);

  // If user has no companies, redirect to new company creation
  if (!userCompanies || userCompanies.length === 0) {
    redirect("/dashboard/new");
  }

  // If user has companies, redirect to the first company's dashboard
  const firstCompany = userCompanies[0];
  redirect(`/dashboard/${firstCompany.companyid}`);
}
