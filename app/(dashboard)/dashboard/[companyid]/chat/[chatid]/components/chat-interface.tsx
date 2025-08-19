"use client";

import { useState } from "react";
import { Chat, ChatMessage } from "@/db/tables/chat";
import { MessageCircle } from "lucide-react";
import { sendChatMessage } from "../../../functions/chat-actions";
import { useRouter } from "next/navigation";
import { 
  AIConversation, 
  AIConversationEmpty, 
  AIConversationEmptyIcon, 
  AIConversationEmptyTitle, 
  AIConversationEmptyDescription 
} from "@/app/components/ui/ai/enhanced-conversation";
import { 
  AIMessage, 
  AIMessageAvatar, 
  AIMessageContent 
} from "@/app/components/ui/ai/enhanced-message";
import { 
  AIInput, 
  AIInputTextarea, 
  AIInputToolbar, 
  AIInputSubmit,
  AIInputStatus,
  AIInputButton,
  AIInputTools,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
} from "@/app/components/ui/ai/enhanced-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  FileIcon,
  ImageIcon,
  MicIcon,
  PlusIcon,
  GlobeIcon,
  CameraIcon,
  ScreenShareIcon,
} from "lucide-react";
import Image from "next/image";
import { AIResponse } from "@/app/components/ui/ai/response";
import { AITypingIndicator } from "@/app/components/ui/ai/ai-typing-indicator";
import { AISuggestion, AISuggestions } from "@/app/components/ui/ai/ai-suggestions";
import { toast } from "sonner";

interface ChatInterfaceProps {
  chat: Chat;
  initialMessages: ChatMessage[];
  companyId: string;
}

export function ChatInterface({
  chat,
  initialMessages,
  companyId,
}: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [inputStatus, setInputStatus] = useState<AIInputStatus>("ready");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [suggestedTitle, setSuggestedTitle] = useState<string | null>(null);
  const [model, setModel] = useState<string>("gpt-4");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);

  // Sample models and suggestions
  const models = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai.com' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai.com' },
    { id: 'claude-2', name: 'Claude 2', provider: 'anthropic.com' },
    { id: 'claude-instant', name: 'Claude Instant', provider: 'anthropic.com' },
  ];

  const suggestions = [
    'Help me analyze my financial reports',
    'What are the key accounting principles?',
    'Explain expense categorization',
    'How do I handle tax deductions?',
    'Create a budget template',
    'Review my cash flow statements',
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || inputStatus !== "ready") return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setInputStatus("submitted");

    try {
      const formData = new FormData();
      formData.append("chatId", chat.chatid);
      formData.append("content", messageContent);
      formData.append("companyId", companyId);

      const result = await sendChatMessage(formData);

      if (result.success && result.data) {
        // Add user message to UI immediately
        setMessages((prev) => [...prev, result.data]);

        // Start AI response streaming
        await streamAIResponse(messageContent);
      } else {
        console.error("Failed to send message:", result.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setInputStatus("ready");
    }
  };

  const streamAIResponse = async (userMessage: string) => {
    setInputStatus("streaming");
    setStreamingMessage("");

    try {
      const response = await fetch(`/api/chat/${chat.chatid}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          companyId: companyId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              // Save the complete AI response to database
              await saveAIResponse(accumulatedResponse);
              setInputStatus("ready");
              setStreamingMessage("");
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedResponse += parsed.content;
                setStreamingMessage(accumulatedResponse);
              }
              if (parsed.suggestedTitle) {
                setSuggestedTitle(parsed.suggestedTitle);
              }
            } catch {
              // Ignore parsing errors for partial JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Error streaming AI response:", error);
      setInputStatus("error");
      setStreamingMessage("");
    }
  };

  const saveAIResponse = async (content: string) => {
    try {
      const formData = new FormData();
      formData.append("chatId", chat.chatid);
      formData.append("content", content);
      formData.append("companyId", companyId);
      formData.append("role", "assistant");

      const result = await sendChatMessage(formData);

      if (result.success && result.data) {
        setMessages((prev) => [...prev, result.data]);
        
        // Update chat title if we have a suggested title and it's still the default date-based title
        if (suggestedTitle && chat.title.includes("Chat ")) {
          await updateChatTitle(suggestedTitle);
        }
        
        router.refresh(); // Refresh to update sidebar
      }
    } catch (error) {
      console.error("Error saving AI response:", error);
    }
  };

  const updateChatTitle = async (newTitle: string) => {
    try {
      const formData = new FormData();
      formData.append("chatId", chat.chatid);
      formData.append("newTitle", newTitle);
      formData.append("companyId", companyId);

      // Use the rename action
      const { renameChatAction } = await import("../../../functions/chat-actions");
      await renameChatAction(formData);
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  const handleFileAction = (action: string) => {
    toast.success('File action', {
      description: action,
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Optionally auto-send the suggestion
    // handleSendMessage(new Event('submit') as any);
  };


  if (messages.length === 0 && !streamingMessage) {
    return (
      <div className="relative h-full flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <AIConversationEmpty>
            <AIConversationEmptyIcon>
              <MessageCircle className="h-6 w-6" />
            </AIConversationEmptyIcon>
            <AIConversationEmptyTitle>
              Start a conversation
            </AIConversationEmptyTitle>
            <AIConversationEmptyDescription>
              Ask me anything about your accounting needs. I&apos;m here to help!
            </AIConversationEmptyDescription>
          </AIConversationEmpty>

          <div className="grid shrink-0 gap-4 pt-4 pb-32">
            <AISuggestions className="px-4">
              {suggestions.map((suggestion) => (
                <AISuggestion
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  suggestion={suggestion}
                />
              ))}
            </AISuggestions>
          </div>
        </div>
          
        {/* Absolute positioned input at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
            <AIInput onSubmit={handleSendMessage}>
              <AIInputTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Ask me anything about your accounting..."
                rows={3}
              />
              <AIInputToolbar>
                <AIInputTools>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AIInputButton>
                        <PlusIcon size={16} />
                        <span className="sr-only">Add attachment</span>
                      </AIInputButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleFileAction('upload-file')}>
                        <FileIcon className="mr-2" size={16} />
                        Upload file
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileAction('upload-photo')}>
                        <ImageIcon className="mr-2" size={16} />
                        Upload photo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileAction('take-screenshot')}>
                        <ScreenShareIcon className="mr-2" size={16} />
                        Take screenshot
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFileAction('take-photo')}>
                        <CameraIcon className="mr-2" size={16} />
                        Take photo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AIInputButton
                    onClick={() => setUseMicrophone(!useMicrophone)}
                    variant={useMicrophone ? 'default' : 'ghost'}
                  >
                    <MicIcon size={16} />
                    <span className="sr-only">Microphone</span>
                  </AIInputButton>
                  <AIInputButton
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    variant={useWebSearch ? 'default' : 'ghost'}
                  >
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </AIInputButton>
                  <AIInputModelSelect onValueChange={setModel} value={model}>
                    <AIInputModelSelectTrigger>
                      <AIInputModelSelectValue />
                    </AIInputModelSelectTrigger>
                    <AIInputModelSelectContent>
                      {models.map((modelOption) => (
                        <AIInputModelSelectItem key={modelOption.id} value={modelOption.id}>
                          <Image
                            alt={modelOption.provider}
                            className="inline-flex size-4"
                            height={16}
                            src={`https://www.google.com/s2/favicons?domain=${modelOption.provider}`}
                            unoptimized
                            width={16}
                          />
                          {modelOption.name}
                        </AIInputModelSelectItem>
                      ))}
                    </AIInputModelSelectContent>
                  </AIInputModelSelect>
                </AIInputTools>
                <AIInputSubmit 
                  status={inputStatus}
                  disabled={!inputValue.trim()}
                />
              </AIInputToolbar>
            </AIInput>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <AIConversation>
        {messages.map((message) => (
          <AIMessage key={message.messageid} from={message.role as "assistant" | "user"}>
            <AIMessageAvatar 
              name={message.role === "user" ? "You" : "AI Assistant"} 
            />
            <AIMessageContent>
              {message.role === "assistant" ? (
                <AIResponse>{message.content}</AIResponse>
              ) : (
                <div className="rounded-lg bg-primary text-primary-foreground px-4 py-2">
                  {message.content}
                </div>
              )}
            </AIMessageContent>
          </AIMessage>
        ))}

        {/* Streaming AI response */}
        {inputStatus === "streaming" && (
          <AIMessage from="assistant">
            <AIMessageAvatar name="AI Assistant" />
            <AIMessageContent>
              {streamingMessage ? (
                <AIResponse>{streamingMessage}</AIResponse>
              ) : (
                <AITypingIndicator />
              )}
            </AIMessageContent>
          </AIMessage>
        )}
        </AIConversation>
      </div>

      {/* Absolute positioned input at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <AIInput onSubmit={handleSendMessage}>
          <AIInputTextarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type your message..."
            rows={3}
          />
          <AIInputToolbar>
            <AIInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <AIInputButton>
                    <PlusIcon size={16} />
                    <span className="sr-only">Add attachment</span>
                  </AIInputButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleFileAction('upload-file')}>
                    <FileIcon className="mr-2" size={16} />
                    Upload file
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileAction('upload-photo')}>
                    <ImageIcon className="mr-2" size={16} />
                    Upload photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileAction('take-screenshot')}>
                    <ScreenShareIcon className="mr-2" size={16} />
                    Take screenshot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileAction('take-photo')}>
                    <CameraIcon className="mr-2" size={16} />
                    Take photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AIInputButton
                onClick={() => setUseMicrophone(!useMicrophone)}
                variant={useMicrophone ? 'default' : 'ghost'}
              >
                <MicIcon size={16} />
                <span className="sr-only">Microphone</span>
              </AIInputButton>
              <AIInputButton
                onClick={() => setUseWebSearch(!useWebSearch)}
                variant={useWebSearch ? 'default' : 'ghost'}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </AIInputButton>
              <AIInputModelSelect onValueChange={setModel} value={model}>
                <AIInputModelSelectTrigger>
                  <AIInputModelSelectValue />
                </AIInputModelSelectTrigger>
                <AIInputModelSelectContent>
                  {models.map((modelOption) => (
                    <AIInputModelSelectItem key={modelOption.id} value={modelOption.id}>
                      <Image
                        alt={modelOption.provider}
                        className="inline-flex size-4"
                        height={16}
                        src={`https://www.google.com/s2/favicons?domain=${modelOption.provider}`}
                        unoptimized
                        width={16}
                      />
                      {modelOption.name}
                    </AIInputModelSelectItem>
                  ))}
                </AIInputModelSelectContent>
              </AIInputModelSelect>
            </AIInputTools>
            <AIInputSubmit 
              status={inputStatus}
              disabled={!inputValue.trim()}
            />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
}
