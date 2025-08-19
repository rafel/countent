"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

interface AIConversationProps {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
  showScrollButton?: boolean;
}

const AIConversation = React.forwardRef<HTMLDivElement, AIConversationProps>(
  ({ children, className, autoScroll = true, showScrollButton = true, ...props }, ref) => {
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);
    const [isAtBottom, setIsAtBottom] = React.useState(true);

    // Auto-scroll to bottom when new messages are added
    React.useEffect(() => {
      if (autoScroll && isAtBottom && scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [children, autoScroll, isAtBottom]);

    // Handle scroll events to show/hide scroll button
    const handleScroll = React.useCallback(() => {
      if (!scrollAreaRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsAtBottom(isNearBottom);
      setShowScrollToBottom(!isNearBottom && showScrollButton);
    }, [showScrollButton]);

    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    return (
      <div ref={ref} className={cn("relative flex flex-col", className)} {...props}>
        <ScrollArea
          ref={scrollAreaRef}
          onScroll={handleScroll}
          className="flex-1 px-4 py-2"
        >
          <div className="space-y-4">
            {children}
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 z-10 rounded-full shadow-md"
          >
            <ChevronDown className="h-4 w-4" />
            <span className="sr-only">Scroll to bottom</span>
          </Button>
        )}
      </div>
    );
  }
);

AIConversation.displayName = "AIConversation";

const AIConversationContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4 pb-4", className)}
    {...props}
  />
));

AIConversationContent.displayName = "AIConversationContent";

export { AIConversation, AIConversationContent, type AIConversationProps };
