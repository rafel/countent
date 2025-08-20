import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries/chat-server";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page(props: { params: Promise<{ chatid: string }> }) {
  const params = await props.params;
  const { chatid } = params;
  const chat = await getChatById({ id: chatid });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect("/api/auth/guest");
  }

  if (chat.visibility === "private") {
    if (!session.user) {
      return notFound();
    }

    if (session.user.userid !== chat.userid) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id: chatid,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.chatid}
          initialMessages={uiMessages}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.userid !== chat.userid}
          session={session}
          autoResume={true}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.chatid}
        initialMessages={uiMessages}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={session?.user?.userid !== chat.userid}
        session={session}
        autoResume={true}
      />
      <DataStreamHandler />
    </>
  );
}
