import SuccessContent from "./components/success-content";

interface PageProps {
  params: Promise<{ workspaceid: string }>;
}

export default async function SubscriptionSuccessPage({ params }: PageProps) {
  const { workspaceid } = await params;

  return (
    <div className="container mx-auto py-8">
      <SuccessContent workspaceId={workspaceid} />
    </div>
  );
}
