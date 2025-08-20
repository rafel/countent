'use server';

import { getSuggestionsByDocumentId } from '@/lib/db/queries/chat-server';

export async function getSuggestions({ documentId }: { documentId: string }) {
  const suggestions = await getSuggestionsByDocumentId({ documentId });
  return suggestions ?? [];
}
