interface CompanyDashboardProps {
  params: Promise<{ companyid: string }>;
}

export default async function Dashboard({ params }: CompanyDashboardProps) {
  const { companyid } = await params;
  return (
    <>
      <div
        className="grid auto-rows-min gap-4 md:grid-cols-3"
        title={companyid}
      >
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </>
  );
}
