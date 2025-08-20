import { NextResponse } from 'next/server';
import { auth } from '@/utils/user';
import { getChatsByUserId } from '@/lib/db/queries/chat';
import { ChatSDKError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const startingAfter = searchParams.get('startingAfter');
    const endingBefore = searchParams.get('endingBefore');

    const result = await getChatsByUserId({
      id: session.user.id,
      limit,
      startingAfter,
      endingBefore,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    
    console.error('Unexpected error in chats route:', error);
    return new ChatSDKError('internal_server_error:chat').toResponse();
  }
}
