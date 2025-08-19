import { cache } from "react";
import { dbclient } from "@/db/db";
import { chats, chatMessages, chatUsers, Chat, ChatMessage, NewChat, NewChatMessage, NewChatUser } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

/**
 * Get all chats for a company that a user has access to
 */
export const getCompanyChats = cache(async (companyid: string, userid: string): Promise<Chat[]> => {
  try {
    const userChats = await dbclient
      .select({
        chatid: chats.chatid,
        companyid: chats.companyid,
        createdby: chats.createdby,
        title: chats.title,
        description: chats.description,
        isshared: chats.isshared,
        createdat: chats.createdat,
        updatedat: chats.updatedat,
        lastmessageat: chats.lastmessageat,
      })
      .from(chats)
      .leftJoin(chatUsers, eq(chats.chatid, chatUsers.chatid))
      .where(
        and(
          eq(chats.companyid, companyid),
          sql`(${chats.createdby} = ${userid} OR ${chats.isshared} = true OR ${chatUsers.userid} = ${userid})`
        )
      )
      .orderBy(desc(chats.lastmessageat));

    return userChats;
  } catch (error) {
    console.error("Error fetching company chats:", error);
    return [];
  }
});

/**
 * Get a specific chat with access validation
 */
export const getChat = cache(async (chatid: string, userid: string): Promise<Chat | null> => {
  try {
    const chat = await dbclient
      .select()
      .from(chats)
      .leftJoin(chatUsers, eq(chats.chatid, chatUsers.chatid))
      .where(
        and(
          eq(chats.chatid, chatid),
          sql`(${chats.createdby} = ${userid} OR ${chats.isshared} = true OR ${chatUsers.userid} = ${userid})`
        )
      )
      .limit(1);

    return chat.length > 0 ? chat[0].chats : null;
  } catch (error) {
    console.error("Error fetching chat:", error);
    return null;
  }
});

/**
 * Get messages for a chat
 */
export const getChatMessages = cache(async (chatid: string): Promise<ChatMessage[]> => {
  try {
    const messages = await dbclient
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatid, chatid))
      .orderBy(chatMessages.createdat);

    return messages;
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
});

/**
 * Create a new chat
 */
export async function createChat(newChat: NewChat): Promise<Chat | null> {
  try {
    const result = await dbclient
      .insert(chats)
      .values(newChat)
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
}

/**
 * Add a message to a chat
 */
export async function addChatMessage(message: NewChatMessage): Promise<ChatMessage | null> {
  try {
    const result = await dbclient
      .insert(chatMessages)
      .values(message)
      .returning();

    // Update chat's lastmessageat
    await dbclient
      .update(chats)
      .set({ lastmessageat: new Date() })
      .where(eq(chats.chatid, message.chatid));

    return result[0] || null;
  } catch (error) {
    console.error("Error adding chat message:", error);
    return null;
  }
}

/**
 * Delete a chat (only by creator)
 */
export async function deleteChat(chatid: string, userid: string): Promise<boolean> {
  try {
    const result = await dbclient
      .delete(chats)
      .where(
        and(
          eq(chats.chatid, chatid),
          eq(chats.createdby, userid)
        )
      );

    return !!result;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
}

/**
 * Share chat with a user
 */
export async function shareChatWithUser(chatid: string, userid: string, canwrite: boolean = true): Promise<boolean> {
  try {
    const newChatUser: NewChatUser = {
      chatid,
      userid,
      canwrite,
    };

    await dbclient
      .insert(chatUsers)
      .values(newChatUser);

    return true;
  } catch (error) {
    console.error("Error sharing chat with user:", error);
    return false;
  }
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatid: string, title: string, userid: string): Promise<boolean> {
  try {
    const result = await dbclient
      .update(chats)
      .set({ title, updatedat: new Date() })
      .where(
        and(
          eq(chats.chatid, chatid),
          eq(chats.createdby, userid)
        )
      );

    return !!result;
  } catch (error) {
    console.error("Error updating chat title:", error);
    return false;
  }
}

/**
 * Toggle chat sharing status
 */
export async function toggleChatSharing(chatid: string, userid: string): Promise<boolean> {
  try {
    // First get current sharing status
    const chat = await dbclient
      .select({ isshared: chats.isshared })
      .from(chats)
      .where(
        and(
          eq(chats.chatid, chatid),
          eq(chats.createdby, userid)
        )
      )
      .limit(1);

    if (chat.length === 0) return false;

    const newSharedStatus = !chat[0].isshared;

    const result = await dbclient
      .update(chats)
      .set({ isshared: newSharedStatus, updatedat: new Date() })
      .where(
        and(
          eq(chats.chatid, chatid),
          eq(chats.createdby, userid)
        )
      );

    return !!result;
  } catch (error) {
    console.error("Error toggling chat sharing:", error);
    return false;
  }
}