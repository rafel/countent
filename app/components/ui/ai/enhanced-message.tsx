"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface AIMessageProps {
  from: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
}

const AIMessage = React.forwardRef<HTMLDivElement, AIMessageProps>(
  ({ from, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex gap-4 py-6",
          from === "user" && "flex-row-reverse",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {children}
        </div>
      </div>
    );
  }
);

AIMessage.displayName = "AIMessage";

interface AIMessageAvatarProps {
  src?: string;
  name: string;
  className?: string;
}

const AIMessageAvatar = React.forwardRef<HTMLDivElement, AIMessageAvatarProps>(
  ({ src, name, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex-shrink-0", className)} {...props}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={src} alt={name} />
          <AvatarFallback>
            {name === "OpenAI" || name.toLowerCase().includes("ai") ? (
              <Bot className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }
);

AIMessageAvatar.displayName = "AIMessageAvatar";

const AIMessageContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AIMessageContent.displayName = "AIMessageContent";

export {
  AIMessage,
  AIMessageAvatar,
  AIMessageContent,
  type AIMessageProps,
  type AIMessageAvatarProps,
};
