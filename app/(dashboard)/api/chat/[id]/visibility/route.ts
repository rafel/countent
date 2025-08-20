import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { updateChatVisiblityById } from "@/lib/db/queries/chat-server";
import { z } from "zod";

const updateVisibilitySchema = z.object({
  visibility: z.enum(["private", "shared"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.userid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: chatId } = await params;
    const body = await request.json();
    
    const { visibility } = updateVisibilitySchema.parse(body);

    await updateChatVisiblityById({
      chatId,
      visibility,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat visibility:", error);
    return NextResponse.json(
      { error: "Failed to update chat visibility" },
      { status: 500 }
    );
  }
}
