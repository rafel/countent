import { auth } from "@/lib/user";
import { ChatSDKError } from "@/lib/errors";
import { getWorkspaceForUser } from "@/lib/db/queries/workspace";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter workspaceId is required."
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:api").toResponse();
  }

  const subscription = await getWorkspaceForUser(session.user.id, workspaceId);

  return Response.json(subscription, { status: 200 });
}
