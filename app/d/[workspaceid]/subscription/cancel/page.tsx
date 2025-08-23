import CancelContent from "./components/cancel-content";
import { getUser } from "@/lib/user";

interface PageProps {
  params: Promise<{ workspaceid: string }>;
}

export default async function SubscriptionCancelPage({ params }: PageProps) {
  const { workspaceid } = await params;
  const user = await getUser();

  return (
    <div className="container mx-auto py-8">
      <CancelContent user={user} workspaceId={workspaceid} />
    </div>
  );
}
