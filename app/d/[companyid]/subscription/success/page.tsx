import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/user";
import { getUserCompanies } from "@/lib/db/queries/company";
import SuccessContent from "./components/success-content";

interface PageProps {
  params: Promise<{ companyid: string }>;
}

export default async function SubscriptionSuccessPage({ params }: PageProps) {
  const { companyid } = await params;

  // Get the user from the database to ensure we have the user ID
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  // Verify user has access to this company
  const companies = await getUserCompanies(user.userid);
  const company = companies.find((c) => c.companyid === companyid);

  if (!company) {
    redirect("/d");
  }

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent company={company} />
      </Suspense>
    </div>
  );
}
