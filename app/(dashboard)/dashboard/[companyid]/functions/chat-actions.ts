"use server";

import { getUser } from "@/utils/user";
import { createChat, deleteChat, updateChatTitle, addChatMessage } from "@/utils/chat";
import { NewChat, NewChatMessage } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createNewChat(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    const companyId = formData.get("companyId") as string;
    const title = formData.get("title") as string;

    if (!companyId || !title) {
      return { success: false, error: "Company ID and title are required" };
    }

    const newChat: NewChat = {
      companyid: companyId,
      createdby: user.userid,
      title: title.trim(),
      isshared: false,
    };

    const chat = await createChat(newChat);

    if (!chat) {
      return { success: false, error: "Failed to create chat" };
    }

    revalidatePath(`/dashboard/${companyId}`);
    return { success: true, data: chat };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function deleteChatAction(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    const chatId = formData.get("chatId") as string;
    const companyId = formData.get("companyId") as string;

    if (!chatId || !companyId) {
      return { success: false, error: "Chat ID and company ID are required" };
    }

    const success = await deleteChat(chatId, user.userid);

    if (!success) {
      return { success: false, error: "Failed to delete chat" };
    }

    revalidatePath(`/dashboard/${companyId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function renameChatAction(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    const chatId = formData.get("chatId") as string;
    const newTitle = formData.get("newTitle") as string;
    const companyId = formData.get("companyId") as string;

    if (!chatId || !newTitle || !companyId) {
      return { success: false, error: "Chat ID, title, and company ID are required" };
    }

    const success = await updateChatTitle(chatId, newTitle.trim(), user.userid);

    if (!success) {
      return { success: false, error: "Failed to rename chat" };
    }

    revalidatePath(`/dashboard/${companyId}`);
    return { success: true };
  } catch (error) {
    console.error("Error renaming chat:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function sendChatMessage(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    const chatId = formData.get("chatId") as string;
    const content = formData.get("content") as string;
    const companyId = formData.get("companyId") as string;
    const role = formData.get("role") as string || "user";

    if (!chatId || !content || !companyId) {
      return { success: false, error: "Chat ID, content, and company ID are required" };
    }

    // Add message (user or assistant)
    const messageData: NewChatMessage = {
      chatid: chatId,
      userid: role === "assistant" ? null : user.userid, // Assistant messages don't have a user
      role: role as "user" | "assistant",
      content: content.trim(),
    };

    const message = await addChatMessage(messageData);

    if (!message) {
      return { success: false, error: "Failed to send message" };
    }

    revalidatePath(`/dashboard/${companyId}/chat/${chatId}`);
    return { success: true, data: message };
  } catch (error) {
    console.error("Error sending chat message:", error);
    return { success: false, error: "Something went wrong" };
  }
}