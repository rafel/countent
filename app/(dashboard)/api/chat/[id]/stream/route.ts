import { auth } from '@/app/(auth)/auth';
import {
  getChatById,
  getMessagesByChatId,
} from '@/lib/db/queries/chat-server';
import type { Chat } from '@/lib/db/tables/chat';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import { createUIMessageStream, JsonToSseTransformStream } from 'ai';
import { getStreamContext } from '../../route';
import { differenceInSeconds } from 'date-fns';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;

  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  // Resumable streams disabled - always return fallback behavior
  if (!streamContext) {
    // Since resumable streams are disabled, we'll try to restore the most recent message
    // if it was created recently (within 15 seconds)
    
    if (!chatId) {
      return new ChatSDKError('bad_request:api').toResponse();
    }

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    let chat: Chat;

    try {
      const chatResult = await getChatById({ id: chatId });
      if (!chatResult) {
        return new ChatSDKError('not_found:chat').toResponse();
      }
      chat = chatResult;
    } catch {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    if (!chat) {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    if (chat.visibility === 'private' && chat.userid !== session.user.userid) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

    const emptyDataStream = createUIMessageStream<ChatMessage>({
      execute: () => {},
    });

    // Try to restore the most recent message if it's recent
    const messages = await getMessagesByChatId({ id: chatId });
    const mostRecentMessage = messages.at(-1);

    if (!mostRecentMessage) {
      return new Response(emptyDataStream.pipeThrough(new JsonToSseTransformStream()), { status: 200 });
    }

    if (mostRecentMessage.role !== 'assistant') {
      return new Response(emptyDataStream.pipeThrough(new JsonToSseTransformStream()), { status: 200 });
    }

    const messageCreatedAt = new Date(mostRecentMessage.createdat);

    if (differenceInSeconds(resumeRequestedAt, messageCreatedAt) > 15) {
      return new Response(emptyDataStream.pipeThrough(new JsonToSseTransformStream()), { status: 200 });
    }

    const restoredStream = createUIMessageStream<ChatMessage>({
      execute: ({ writer }) => {
        writer.write({
          type: 'data-appendMessage',
          data: JSON.stringify(mostRecentMessage),
          transient: true,
        });
      },
    });

    return new Response(
      restoredStream.pipeThrough(new JsonToSseTransformStream()),
      { status: 200 },
    );
  }

  // This should never be reached since streamContext is always null
  return new Response(null, { status: 204 });
}
