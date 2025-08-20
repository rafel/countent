// Re-export types and server functions for backward compatibility
// This file maintains the original API while separating server/client concerns

export type { Chat, Vote, Document, Stream, Suggestion } from "@/lib/db/tables/chat";

// Re-export all server functions
export {
  saveChat,
  deleteChatById,
  getChatsByUserAndCompany,
  getChatById,
  saveMessages,
  getMessagesByChatId,
  voteMessage,
  getVotesByChatId,
  saveDocument,
  getDocumentsById,
  getDocumentById,
  deleteDocumentsByIdAfterTimestamp,
  updateDocument,
  saveSuggestions,
  getSuggestionsByDocumentId,
  getMessageById,
  getMessageCountByUserId,
  deleteMessagesByChatIdAfterTimestamp,
  updateChatVisiblityById,
  getStreamById,
  createStreamId,
  saveStream,
  getStreamsByChatId,
  deleteStreamById,
  getChatsByUserId,
  getChatsWithFirstMessageByUserId,
} from "./chat-server";

// Re-export client functions with different names to avoid conflicts
export {
  updateChatVisiblityById as updateChatVisiblityByIdClient,
  getSuggestionsByDocumentId as getSuggestionsByDocumentIdClient,
} from "./chat-client";
