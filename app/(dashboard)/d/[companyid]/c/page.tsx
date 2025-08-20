import { cookies } from "next/headers";
import { Chat } from "@/components/chat";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";

interface CompanyChatProps {
  params: Promise<{ companyid: string }>;
}

export default async function CompanyChatPage({ params }: CompanyChatProps) {
  const session = await auth();
  const { companyid } = await params;

  if (!session) {
    redirect("/api/auth/guest");
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  const chatModel = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={chatModel}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
        companyId={companyid}
      />
      <DataStreamHandler />
    </>
  );
}
