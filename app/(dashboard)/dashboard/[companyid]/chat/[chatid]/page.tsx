import { getUser } from "@/utils/user";
import { getChat, getChatMessages } from "@/utils/chat";
import { redirect } from "next/navigation";
import { ChatInterface } from "./components/chat-interface";
import { Header } from "@/app/components/sidebar/header";

interface ChatPageProps {
  params: Promise<{ companyid: string; chatid: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const { companyid, chatid } = await params;

  // Get chat and verify user access
  const chat = await getChat(chatid, user.userid);
  if (!chat) {
    redirect(`/dashboard/${companyid}`);
  }

  // Verify chat belongs to the current company
  if (chat.companyid !== companyid) {
    redirect(`/dashboard/${companyid}`);
  }

  // Get chat messages
  const messages = await getChatMessages(chatid);

  return (
    <>
      {/* Absolute Header */}
      <div className="sticky top-0 right-0 z-50">
        <Header />
      </div>
      
      {/* Full height scrollable chat area */}
      <div className="mt-16 flex justify-center">
        <div className="w-full max-w-4xl h-full">
          <ChatInterface 
            chat={chat} 
            initialMessages={messages}
            companyId={companyid}
          />
        </div>
      </div>
    </>
  );
}
