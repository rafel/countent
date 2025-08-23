import { NextResponse } from "next/server";
import { auth } from "@/lib/user";
import { getChatsByUserId } from "@/lib/db/queries/chat";
import { ChatSDKError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 20);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const result = await getChatsByUserId({
      id: session.user.id,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error("Unexpected error in chats route:", error);
    return new ChatSDKError("internal_server_error:chat").toResponse();
  }
}
