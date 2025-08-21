import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/utils/user";
import { getUserCompanies } from "@/utils/company";
import SuccessContent from "./components/success-content";

interface PageProps {
  params: Promise<{ companyid: string }>;
  searchParams: Promise<{ success?: string; session_id?: string }>;
}

export default async function SubscriptionSuccessPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const { companyid } = await params;
  const { success, session_id } = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  // Verify user has access to this company
  const companies = await getUserCompanies(session.user.id);
  const company = companies.find((c) => c.companyid === companyid);

  if (!company) {
    redirect("/d");
  }

  // If no success parameter, redirect to company dashboard
  if (!success || !session_id) {
    redirect(`/d/${companyid}`);
  }

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent 
          company={company} 
          userId={session.user.id}
          sessionId={session_id}
        />
      </Suspense>
    </div>
  );
}
