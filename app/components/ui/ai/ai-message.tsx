"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Copy, ThumbsDown, ThumbsUp, User, Bot } from "lucide-react";

interface AIMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  avatar?: string;
  timestamp?: Date;
  onCopy?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const AIMessage = React.forwardRef<HTMLDivElement, AIMessageProps>(
  ({ 
    role, 
    content, 
    avatar, 
    timestamp, 
    onCopy, 
    onThumbsUp, 
    onThumbsDown, 
    className, 
    children,
    ...props 
  }, ref) => {
    const isUser = role === "user";
    const isAssistant = role === "assistant";

    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex gap-3 py-3",
          isUser && "justify-end",
          className
        )}
        {...props}
      >
        {/* Avatar for assistant messages */}
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
            {avatar ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={avatar} />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            "flex max-w-[80%] flex-col gap-2",
            isUser && "items-end"
          )}
        >
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
              isAssistant && "prose prose-sm max-w-none dark:prose-invert"
            )}
          >
            <div className="">
              {content}
            </div>
            {children}
          </div>

          {/* Message actions for assistant messages */}
          {isAssistant && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {onCopy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopy}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
              {onThumbsUp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThumbsUp}
                  className="h-6 px-2"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
              )}
              {onThumbsDown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThumbsDown}
                  className="h-6 px-2"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Timestamp */}
          {timestamp && (
            <div className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Avatar for user messages */}
        {isUser && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
            {avatar ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={avatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
    );
  }
);

AIMessage.displayName = "AIMessage";

export { AIMessage, type AIMessageProps };
