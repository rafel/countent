"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNewChat, deleteChatAction, renameChatAction } from "@/app/(dashboard)/dashboard/[companyid]/functions/chat-actions";

export function useChatActions(companyId: string) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

  const createChat = async (title: string) => {
    if (!companyId || !title.trim() || isCreating) return { success: false, error: "Title is required" };

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("companyId", companyId);
      formData.append("title", title.trim());

      const result = await createNewChat(formData);

      if (result.success && result.data) {
        router.push(`/dashboard/${companyId}/chat/${result.data.chatid}`);
        router.refresh();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error || "Failed to create chat" };
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      return { success: false, error: "Something went wrong" };
    } finally {
      setIsCreating(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!companyId || isDeleting) return { success: false, error: "Already deleting" };

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("chatId", chatId);
      formData.append("companyId", companyId);

      const result = await deleteChatAction(formData);

      if (result.success) {
        router.refresh();
        // If we're currently viewing this chat, redirect to dashboard
        if (window.location.pathname.includes(chatId)) {
          router.push(`/dashboard/${companyId}`);
        }
        return { success: true };
      } else {
        return { success: false, error: result.error || "Failed to delete chat" };
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      return { success: false, error: "Something went wrong" };
    } finally {
      setIsDeleting(false);
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    if (!companyId || !newTitle.trim() || isRenaming) return { success: false, error: "Title is required" };

    setIsRenaming(true);
    try {
      const formData = new FormData();
      formData.append("chatId", chatId);
      formData.append("newTitle", newTitle.trim());
      formData.append("companyId", companyId);

      const result = await renameChatAction(formData);

      if (result.success) {
        router.refresh();
        return { success: true };
      } else {
        return { success: false, error: result.error || "Failed to rename chat" };
      }
    } catch (error) {
      console.error("Error renaming chat:", error);
      return { success: false, error: "Something went wrong" };
    } finally {
      setIsRenaming(false);
    }
  };

  return {
    createChat,
    deleteChat,
    renameChat,
    isCreating,
    isDeleting,
    isRenaming,
  };
}