import { getUser } from "@/utils/user";
import { getChat } from "@/utils/chat";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatid: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { chatid } = await params;
    const { message, companyId } = await request.json();

    // Verify user has access to this chat
    const chat = await getChat(chatid, user.userid);
    if (!chat || chat.companyid !== companyId) {
      return new Response("Forbidden", { status: 403 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // This is a placeholder for actual AI integration
          // You would replace this with your AI service (OpenAI, Anthropic, etc.)
          const aiResponse = await generateAIResponse(message);
          
          // Stream the response word by word to simulate real-time AI response
          const words = aiResponse.content.split(" ");
          
          for (let i = 0; i < words.length; i++) {
            const chunk = {
              content: words[i] + (i < words.length - 1 ? " " : ""),
            };
            
            const data = `data: ${JSON.stringify(chunk)}\\n\\n`;
            controller.enqueue(encoder.encode(data));
            
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Send suggested title if available
          if (aiResponse.suggestedTitle) {
            const titleChunk = {
              suggestedTitle: aiResponse.suggestedTitle,
            };
            const titleData = `data: ${JSON.stringify(titleChunk)}\\n\\n`;
            controller.enqueue(encoder.encode(titleData));
          }
          
          // Signal completion
          controller.enqueue(encoder.encode("data: [DONE]\\n\\n"));
          controller.close();
        } catch (error) {
          console.error("Error in AI streaming:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat stream API:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Placeholder AI response function
// Replace this with your actual AI service integration
async function generateAIResponse(message: string): Promise<{ content: string; suggestedTitle?: string }> {
  // This is a mock response. Replace with actual AI service call
  const responses = [
    "I understand you're asking about accounting matters. Let me help you with that.",
    "Based on your question about tax regulations, here's what I can tell you...",
    "For your company's financial planning, I recommend considering these factors...",
    "Regarding your invoice management, here are some best practices...",
    "I can help you understand the accounting principles involved in this situation.",
  ];
  
  let content: string;
  let suggestedTitle: string | undefined;

  // Simple mock logic based on message content
  if (message.toLowerCase().includes("tax")) {
    content = "Regarding tax matters, it's important to maintain accurate records and ensure compliance with current regulations. I recommend consulting with a tax professional for specific advice related to your situation.";
    suggestedTitle = "Tax Compliance Discussion";
  } else if (message.toLowerCase().includes("invoice")) {
    content = "For invoice management, ensure all invoices include required information such as date, invoice number, description of goods/services, amounts, and tax details. Proper organization and timely processing are key to maintaining good cash flow.";
    suggestedTitle = "Invoice Management Help";
  } else if (message.toLowerCase().includes("expense")) {
    content = "When managing expenses, categorize them properly for accurate financial reporting. Keep all receipts and documentation. Business expenses should be legitimate, ordinary, and necessary for your operations.";
    suggestedTitle = "Expense Management Guidance";
  } else {
    content = responses[Math.floor(Math.random() * responses.length)] + " Feel free to ask me more specific questions about your accounting needs.";
    suggestedTitle = "Accounting Discussion";
  }

  return { content, suggestedTitle };
}