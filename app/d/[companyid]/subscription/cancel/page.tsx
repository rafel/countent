import { redirect } from "next/navigation";
import { auth } from "@/utils/user";
import { getUserCompanies } from "@/utils/company";
import CancelContent from "./components/cancel-content";

interface PageProps {
  params: Promise<{ companyid: string }>;
  searchParams: Promise<{ canceled?: string }>;
}

export default async function SubscriptionCancelPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const { companyid } = await params;
  const { canceled } = await searchParams;
  console.log(canceled);

  if (!session?.user) {
    redirect("/login");
  }

  // Verify user has access to this company
  const companies = await getUserCompanies(session.user.id);
  const company = companies.find((c) => c.companyid === companyid);

  if (!company) {
    redirect("/d");
  }

  return (
    <div className="container mx-auto py-8">
      <CancelContent 
        company={company} 
        userId={session.user.id}
      />
    </div>
  );
}
