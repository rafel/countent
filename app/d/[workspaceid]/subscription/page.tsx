import { redirect } from "next/navigation";

export default async function SubscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { workspaceid } = await params;
  const { success } = await searchParams;
  if (success) {
    redirect(`/d/${workspaceid}/subscription/success`);
  } else {
    redirect(`/d/${workspaceid}/subscription/cancel`);
  }
}
