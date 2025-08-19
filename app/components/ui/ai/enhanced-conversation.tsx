"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { AIConversationScrollButton } from "./conversation-scroll-button";

interface AIConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean;
}

const AIConversation = React.forwardRef<HTMLDivElement, AIConversationProps>(
  ({ children, className, autoScroll = true, ...props }, ref) => {
    const [showScrollButton, setShowScrollButton] = React.useState(false);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = React.useCallback(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          // Use setTimeout to ensure DOM has updated
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }, 10);
        }
      }
    }, []);

    const handleScroll = React.useCallback(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
          setShowScrollButton(!isAtBottom);
        }
      }
    }, []);

    // Auto-scroll when children change (new messages)
    React.useEffect(() => {
      if (autoScroll) {
        scrollToBottom();
      }
    }, [children, autoScroll, scrollToBottom]);

    // Also scroll when component mounts
    React.useEffect(() => {
      if (autoScroll) {
        // Delay to ensure content is rendered
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }, [autoScroll, scrollToBottom]);

    React.useEffect(() => {
      const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);

    return (
      <div ref={ref} className={cn("relative flex flex-1 flex-col", className)} {...props}>
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div ref={contentRef} className="space-y-4 pb-24">
            {children}
          </div>
        </ScrollArea>
        <AIConversationScrollButton 
          isVisible={showScrollButton} 
          onScrollToBottom={scrollToBottom} 
        />
      </div>
    );
  }
);

AIConversation.displayName = "AIConversation";

const AIConversationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4 pb-24", className)} {...props}>
        {children}
      </div>
    );
  }
);

AIConversationContent.displayName = "AIConversationContent";

const AIConversationEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-1 flex-col items-center justify-center gap-4 text-center", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AIConversationEmpty.displayName = "AIConversationEmpty";

const AIConversationEmptyIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-muted", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AIConversationEmptyIcon.displayName = "AIConversationEmptyIcon";

const AIConversationEmptyTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

AIConversationEmptyTitle.displayName = "AIConversationEmptyTitle";

const AIConversationEmptyDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

AIConversationEmptyDescription.displayName = "AIConversationEmptyDescription";

export {
  AIConversation,
  AIConversationContent,
  AIConversationEmpty,
  AIConversationEmptyIcon,
  AIConversationEmptyTitle,
  AIConversationEmptyDescription,
  type AIConversationProps,
};
