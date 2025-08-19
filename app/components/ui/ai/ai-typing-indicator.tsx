"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface AITypingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showAvatar?: boolean;
  text?: string;
}

const AITypingIndicator = React.forwardRef<HTMLDivElement, AITypingIndicatorProps>(
  ({ className, size = "md", showAvatar = true, text, ...props }, ref) => {
    const sizeClasses = {
      sm: "gap-1",
      md: "gap-2",
      lg: "gap-3",
    };

    const dotSizes = {
      sm: "h-1 w-1",
      md: "h-1.5 w-1.5", 
      lg: "h-2 w-2",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", sizeClasses[size], className)}
        {...props}
      >
        {showAvatar && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background shadow">
            <Bot className="h-4 w-4" />
          </div>
        )}
        <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
          {text ? (
            <span className="text-sm text-muted-foreground">{text}</span>
          ) : (
            <>
              <div className={cn("animate-bounce rounded-full bg-muted-foreground/60", dotSizes[size])} style={{ animationDelay: "0ms" }} />
              <div className={cn("animate-bounce rounded-full bg-muted-foreground/60", dotSizes[size])} style={{ animationDelay: "150ms" }} />
              <div className={cn("animate-bounce rounded-full bg-muted-foreground/60", dotSizes[size])} style={{ animationDelay: "300ms" }} />
            </>
          )}
        </div>
      </div>
    );
  }
);

AITypingIndicator.displayName = "AITypingIndicator";

export { AITypingIndicator, type AITypingIndicatorProps };