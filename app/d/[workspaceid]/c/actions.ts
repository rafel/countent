'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
  updateChatTitleById,
  deleteChatById,
} from '@/lib/db/queries/chat';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function renameChatAction(formData: FormData) {
  try {
    const chatId = formData.get('chatId') as string;
    const title = formData.get('title') as string;

    if (!chatId || !title?.trim()) {
      return { success: false, error: "Chat ID and title are required" };
    }

    const updatedChat = await updateChatTitleById({
      chatId,
      title: title.trim(),
    });

    return { success: true, data: updatedChat };
  } catch (error) {
    console.error('Error renaming chat:', error);
    return { success: false, error: "Failed to rename chat" };
  }
}

export async function deleteChatAction(formData: FormData) {
  try {
    const chatId = formData.get('chatId') as string;

    if (!chatId) {
      return { success: false, error: "Chat ID is required" };
    }

    const deletedChat = await deleteChatById({ id: chatId });

    return { success: true, data: deletedChat };
  } catch (error) {
    console.error('Error deleting chat:', error);
    return { success: false, error: "Failed to delete chat" };
  }
}
