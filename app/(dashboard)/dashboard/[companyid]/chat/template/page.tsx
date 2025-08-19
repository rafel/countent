import { getUser } from "@/utils/user";
import { redirect } from "next/navigation";
import ChatTemplate from "@/app/components/templates/chat-template";
import { Header } from "@/app/components/sidebar/header";

interface TemplatePageProps {
  params: Promise<{ companyid: string }>;
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  await params; // Just ensure params are awaited

  return (
    <>
      {/* Fixed Header using the global Header component */}
      <div className="sticky top-0 z-50 -m-4 -mt-0">
        <Header />
      </div>
      
      {/* Template title bar */}
      <div className="sticky top-16 z-40 -mx-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-center">
          <div className="w-full max-w-4xl px-4">
            <h1 className="text-lg font-semibold">Chat Template Preview</h1>
            <p className="text-sm text-muted-foreground">Advanced AI chat interface demonstration</p>
          </div>
        </div>
      </div>
      
      {/* Template interface without height constraints */}
      <div className="flex justify-center -mx-4">
        <div className="w-full max-w-4xl">
          <ChatTemplate />
        </div>
      </div>
    </>
  );
}
