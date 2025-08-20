import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { auth } from "@/app/(auth)/auth";
import { type RequestHints, systemPrompt } from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries/chat-server";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { generateTitleFromUserMessage } from "../../d/(chat)/c/actions";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { isProductionEnvironment } from "@/lib/constants";
import { myProvider } from "@/lib/ai/providers";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import { postRequestBodySchema, type PostRequestBody } from "./schema";
// Resumable streams disabled - remove redis dependency
// import {
//   createResumableStreamContext,
//   type ResumableStreamContext,
// } from "resumable-stream";
// import { after } from "next/server"; // Not needed without resumable streams
import { ChatSDKError } from "@/lib/errors";
import type { VisibilityType } from "@/components/visibility-selector";
import type { UserType } from "@/lib/db/tables/user";
import { geolocation } from "@vercel/functions";

export const maxDuration = 60;

// Resumable streams disabled - no global context needed

export function getStreamContext() {
  // Resumable streams disabled - always return null
  return null;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.error("Schema validation error:", error);
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id: chatid,
      companyid,
      message,
      selectedChatModel,
      selectedVisibilityType,
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    // Use the provided company ID from the request
    if (!companyid) {
      return new ChatSDKError("bad_request:api").toResponse();
    }
    
    const actualCompanyId = companyid;

    const userType: UserType = session.user.type || 'regular';

    const messageCount = await getMessageCountByUserId({
      id: session.user.userid,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id: chatid });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id: chatid,
        userId: session.user.userid,
        companyId: actualCompanyId,
        title,
        visibility: selectedVisibilityType as VisibilityType,
      });
    } else {
      if (chat.userid !== session.user.userid) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    }

    const messagesFromDb = await getMessagesByChatId({ id: chatid });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude: longitude ? Number(longitude) : 0,
      latitude: latitude ? Number(latitude) : 0,
      city: city || "",
      country: country || "",
    };

    await saveMessages({
      messages: [
        {
          chatid: chatid,
          messageid: message.id,
          role: "user",
          parts: message.parts,
          attachments: [],
          createdat: new Date(),
        },
      ],
    });

    // Stream ID creation removed - not needed without resumable streams

    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === "chat-model-reasoning"
              ? []
              : [
                  "getWeather",
                  "createDocument",
                  "updateDocument",
                  "requestSuggestions",
                ],
          experimental_transform: smoothStream({ chunking: "word" }),
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((message) => ({
            messageid: message.id,
            role: message.role,
            parts: message.parts,
            createdat: new Date(),
            attachments: [],
            chatid: chatid,
          })),
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    // Resumable streams disabled - use regular streaming
    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (!chat || chat.userid !== session.user.userid) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
