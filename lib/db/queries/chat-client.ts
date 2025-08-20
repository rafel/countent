// Client-safe database operations (no "server-only" import)
// These functions should only be called from client-side code or server actions

import type { VisibilityType } from "@/components/visibility-selector";

// Client-side function to update chat visibility via API
export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    const response = await fetch(`/api/chat/${chatId}/visibility`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    });

    if (!response.ok) {
      throw new Error("Failed to update chat visibility");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating chat visibility:", error);
    throw new Error("Failed to update chat visibility");
  }
}

// Client-side function to get suggestions via API
export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const response = await fetch(`/api/suggestions?documentId=${documentId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
