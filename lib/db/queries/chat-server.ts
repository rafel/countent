import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  or,
} from "drizzle-orm";

import {
  chat,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  stream,
  type NewDBMessage,
} from "@/lib/db/tables/chat";
import { db } from "@/lib/db/db";
import { generateUUID } from "@/lib/utils";

export async function saveChat({
  id,
  title,
  userId,
  companyId,
  visibility = "private",
}: {
  id: string;
  title: string;
  userId: string;
  companyId: string;
  visibility?: "private" | "shared";
}) {
  try {
    return await db.insert(chat).values({
      chatid: id,
      createdat: new Date(),
      userid: userId,
      companyid: companyId,
      title,
      visibility,
    });
  } catch {
    throw new Error("Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatid, id));
    await db.delete(message).where(eq(message.chatid, id));

    return await db.delete(chat).where(eq(chat.chatid, id));
  } catch {
    throw new Error("Failed to delete chat");
  }
}

export async function getChatsByUserAndCompany({
  userId,
  companyId,
}: {
  userId: string;
  companyId: string;
}) {
  try {
    return await db
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.userid, userId),
          or(
            eq(chat.companyid, companyId),
            and(eq(chat.visibility, "shared"), eq(chat.companyid, companyId))
          )
        )
      )
      .orderBy(desc(chat.createdat));
  } catch {
    return [];
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.chatid, id));
    return selectedChat;
  } catch {
    return null;
  }
}

export async function saveMessages({ messages }: { messages: Array<NewDBMessage> }) {
  try {
    return await db.insert(message).values(messages);
  } catch {
    throw new Error("Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatid, id))
      .orderBy(asc(message.createdat));
  } catch {
    return [];
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageid, messageId), eq(vote.chatid, chatId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isupvoted: type === "up" ? true : false })
        .where(and(eq(vote.messageid, messageId), eq(vote.chatid, chatId)));
    } else {
      return await db.insert(vote).values({
        chatid: chatId,
        messageid: messageId,
        isupvoted: type === "up" ? true : false,
      });
    }
  } catch {
    throw new Error("Failed to save vote");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatid, id));
  } catch {
    return [];
  }
}

export async function saveDocument({
  id,
  title,
  content,
  userId,
  kind,
}: {
  id: string;
  title: string;
  content: string;
  userId: string;
  kind: "image" | "sheet";
}) {
  try {
    const [doc] = await db.insert(document).values({
      documentid: id,
      title,
      content,
      userid: userId,
      createdat: new Date(),
      kind,
    });

    return doc;
  } catch {
    throw new Error("Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.documentid, id))
      .orderBy(asc(document.createdat));

    return documents;
  } catch {
    return [];
  }
}

export async function getDocumentById({
  id,
  createdAt,
}: {
  id: string;
  createdAt?: Date;
}) {
  try {
    if (createdAt) {
      const [selectedDocument] = await db
        .select()
        .from(document)
        .where(
          and(eq(document.documentid, id), eq(document.createdat, createdAt))
        );
      return selectedDocument;
    }

    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.documentid, id))
      .orderBy(desc(document.createdat));

    return selectedDocument;
  } catch {
    return null;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentid, id),
          gt(suggestion.documentcreatedat, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.documentid, id), gt(document.createdat, timestamp)));
  } catch {
    throw new Error("Failed to delete documents");
  }
}

export async function updateDocument({
  id,
  title,
  content,
}: {
  id: string;
  title: string;
  content: string;
}) {
  try {
    return await db.insert(document).values({
      documentid: id,
      title,
      content,
      userid: "", // This should be passed from the calling function
      createdat: new Date(),
      kind: "sheet", // This should be determined from context
    });
  } catch {
    throw new Error("Failed to update document");
  }
}

export async function saveSuggestions({
  suggestions: _suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(_suggestions);
  } catch {
    throw new Error("Failed to save suggestions");
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentid, documentId));
  } catch {
    return [];
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const [selectedMessage] = await db
      .select()
      .from(message)
      .where(eq(message.messageid, id));
    return selectedMessage;
  } catch {
    return null;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - differenceInHours);

    const [result] = await db
      .select({ count: count() })
      .from(message)
      .innerJoin(chat, eq(message.chatid, chat.chatid))
      .where(
        and(
          eq(chat.userid, id),
          gte(message.createdat, hoursAgo)
        )
      );

    return result?.count || 0;
  } catch {
    return 0;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(message)
      .where(and(eq(message.chatid, chatId), gte(message.createdat, timestamp)));
  } catch {
    throw new Error("Failed to delete messages");
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "shared";
}) {
  try {
    return await db
      .update(chat)
      .set({ visibility })
      .where(eq(chat.chatid, chatId));
  } catch {
    throw new Error("Failed to update chat visibility");
  }
}

export async function getStreamById({ id }: { id: string }) {
  try {
    const [selectedStream] = await db
      .select()
      .from(stream)
      .where(eq(stream.streamid, id));
    return selectedStream;
  } catch {
    return null;
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    return await db.insert(stream).values({
      streamid: streamId,
      chatid: chatId,
      createdat: new Date(),
    });
  } catch {
    throw new Error("Failed to create stream");
  }
}

export async function saveStream({
  id,
  chatId,
}: {
  id: string;
  chatId: string;
}) {
  try {
    const streamId = id || generateUUID();
    return await db.insert(stream).values({
      streamid: streamId,
      chatid: chatId,
      createdat: new Date(),
    });
  } catch {
    throw new Error("Failed to save stream");
  }
}

export async function getStreamsByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(stream)
      .where(eq(stream.chatid, id))
      .orderBy(asc(stream.createdat));
  } catch {
    return [];
  }
}

export async function deleteStreamById({ id }: { id: string }) {
  try {
    return await db.delete(stream).where(eq(stream.streamid, id));
  } catch {
    throw new Error("Failed to delete stream");
  }
}

export async function getChatsByUserId({ 
  id,
  limit,
  startingAfter: _startingAfter,
  endingBefore: _endingBefore,
}: { 
  id: string;
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}) {
  try {
    const query = db
      .select()
      .from(chat)
      .where(eq(chat.userid, id))
      .orderBy(desc(chat.createdat));

    if (limit) {
      return await query.limit(limit);
    }

    // Note: startingAfter and endingBefore pagination would need additional implementation
    // For now, we'll ignore these parameters but accept them for API compatibility
    
    return await query;
  } catch {
    return [];
  }
}

export async function getChatsWithFirstMessageByUserId({ id }: { id: string }) {
  try {
    const chats = await db
      .select({
        chatid: chat.chatid,
        title: chat.title,
        createdat: chat.createdat,
        visibility: chat.visibility,
        companyid: chat.companyid,
      })
      .from(chat)
      .where(eq(chat.userid, id))
      .orderBy(desc(chat.createdat));

    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const [firstMessage] = await db
          .select()
          .from(message)
          .where(eq(message.chatid, chat.chatid))
          .orderBy(asc(message.createdat))
          .limit(1);

        return {
          ...chat,
          firstMessage: firstMessage || null,
        };
      })
    );

    return chatsWithMessages;
  } catch {
    return [];
  }
}
