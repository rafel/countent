"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ArrowDown } from "lucide-react";

interface AIConversationScrollButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isVisible?: boolean;
  onScrollToBottom?: () => void;
}

const AIConversationScrollButton = React.forwardRef<HTMLButtonElement, AIConversationScrollButtonProps>(
  ({ className, isVisible = false, onScrollToBottom, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        onClick={onScrollToBottom}
        className={cn(
          "fixed bottom-20 left-1/2 z-10 h-8 w-8 -translate-x-1/2 rounded-full border bg-background p-0 shadow-lg transition-opacity",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
          className
        )}
        {...props}
      >
        <ArrowDown className="h-3 w-3" />
        <span className="sr-only">Scroll to bottom</span>
      </Button>
    );
  }
);

AIConversationScrollButton.displayName = "AIConversationScrollButton";

export { AIConversationScrollButton, type AIConversationScrollButtonProps };