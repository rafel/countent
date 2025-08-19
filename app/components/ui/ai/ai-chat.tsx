"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AIMessage } from "./ai-message";
import { AIInput } from "./ai-input";
import { AIConversation } from "./ai-conversation";
import { AISuggestions } from "./ai-suggestions";
import { AITypingIndicator } from "./ai-typing-indicator";
import { AISources, type Source } from "./ai-sources";
import { AIReasoning, type ReasoningStep } from "./ai-reasoning";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  sources?: Source[];
  reasoning?: ReasoningStep[];
}

interface AIChatProps {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  showSources?: boolean;
  showReasoning?: boolean;
  showCopyButtons?: boolean;
  showFeedback?: boolean;
  onMessageCopy?: (messageId: string) => void;
  onMessageFeedback?: (messageId: string, feedback: "up" | "down") => void;
}

const AIChat = React.forwardRef<HTMLDivElement, AIChatProps>(
  ({
    messages,
    input,
    onInputChange,
    onSendMessage,
    isLoading = false,
    onStop,
    suggestions = [],
    onSuggestionClick,
    className,
    placeholder = "Type your message...",
    showSuggestions = true,
    showSources = true,
    showReasoning = true,
    showCopyButtons = true,
    showFeedback = true,
    onMessageCopy,
    onMessageFeedback,
    ...props
  }, ref) => {

    const handleMessageCopy = (messageId: string) => {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        navigator.clipboard.writeText(message.content);
        onMessageCopy?.(messageId);
      }
    };

    const handleThumbsUp = (messageId: string) => {
      onMessageFeedback?.(messageId, "up");
    };

    const handleThumbsDown = (messageId: string) => {
      onMessageFeedback?.(messageId, "down");
    };

    return (
      <div
        ref={ref}
        className={cn("flex h-full flex-col", className)}
        {...props}
      >
        {/* Chat conversation area */}
        <AIConversation className="flex-1">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <AIMessage
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                onCopy={showCopyButtons ? () => handleMessageCopy(message.id) : undefined}
                onThumbsUp={showFeedback && message.role === "assistant" ? () => handleThumbsUp(message.id) : undefined}
                onThumbsDown={showFeedback && message.role === "assistant" ? () => handleThumbsDown(message.id) : undefined}
              >
                {/* Sources */}
                {showSources && message.sources && message.sources.length > 0 && (
                  <div className="mt-3">
                    <AISources sources={message.sources} maxSources={3} />
                  </div>
                )}

                {/* Reasoning */}
                {showReasoning && message.reasoning && message.reasoning.length > 0 && (
                  <div className="mt-3">
                    <AIReasoning steps={message.reasoning} />
                  </div>
                )}
              </AIMessage>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <AITypingIndicator text="AI is thinking..." />
          )}
        </AIConversation>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
          <div className="border-t p-4">
            <AISuggestions
              title="Try asking:"
              suggestions={suggestions}
              onSuggestionClick={onSuggestionClick || onSendMessage}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4">
          <AIInput
            value={input}
            onChange={onInputChange}
            onSubmit={onSendMessage}
            placeholder={placeholder}
            disabled={isLoading}
            loading={isLoading}
            onStop={onStop}
            maxLength={4000}
          />
        </div>
      </div>
    );
  }
);

AIChat.displayName = "AIChat";

export { AIChat, type AIChatProps, type Message };