import type {
  AssistantModelMessage,
  ToolModelMessage,
  UIMessage,
  UIMessagePart,
} from "ai";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DBMessage, Document } from "@/lib/db/tables/chat";
import { ChatSDKError, type ErrorCode } from "./errors";
import type { ChatMessage, ChatTools, CustomUIDataTypes } from "@/lib/types";
import { formatISO } from "date-fns";

import { genSaltSync, hashSync } from "bcrypt-ts";

export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    const { code, cause } = await response.json();
    throw new ChatSDKError(code as ErrorCode, cause);
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const { code, cause } = await response.json();
      throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response;
  } catch (error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new ChatSDKError("offline:chat");
    }

    throw error;
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessageWithoutId = ToolModelMessage | AssistantModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export async function redirect(url: string) {
  window.location.href = url;
}

// Helper function to open Stripe Billing Portal in new tab
export async function redirectNewTab(
  url: string,
  onReturn?: () => void // Callback when user returns (for refreshing data)
) {
  const portalWindow = window.open(url, "_blank");

  // Optional: Listen for when user returns to refresh data
  if (onReturn && portalWindow) {
    const checkClosed = setInterval(() => {
      if (portalWindow.closed) {
        clearInterval(checkClosed);
        onReturn();
      }
    }, 1000);

    // Cleanup after 30 minutes to prevent memory leaks
    setTimeout(() => {
      clearInterval(checkClosed);
    }, 30 * 60 * 1000);
  }
}
