import { notFound } from "next/navigation";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries/chat-server";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { convertToUIMessages } from "@/lib/utils";

interface CompanyChatPageProps {
  params: Promise<{ companyid: string; chatid: string }>;
}

export default async function CompanyChatPage({ params }: CompanyChatPageProps) {
  const session = await auth();
  const { companyid, chatid } = await params;

  if (!session) {
    redirect("/api/auth/guest");
  }

  const chat = await getChatById({ id: chatid });

  if (!chat) {
    notFound();
  }

  // Verify the chat belongs to the company
  if (chat.companyid !== companyid) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id: chatid });
  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <>
      <Chat
        key={chat.chatid}
        id={chat.chatid}
        initialMessages={uiMessages}
        initialChatModel="gpt-4o-mini" // You might want to get this from chat or user preferences
        initialVisibilityType={chat.visibility}
        isReadonly={false}
        session={session}
        autoResume={true}
        companyId={companyid}
      />
      <DataStreamHandler />
    </>
  );
}
