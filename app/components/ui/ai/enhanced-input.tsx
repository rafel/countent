"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Send, Square, Loader2 } from "lucide-react";

type AIInputStatus = "ready" | "submitted" | "streaming" | "error";

interface AIInputProps {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

const AIInput = React.forwardRef<HTMLFormElement, AIInputProps>(
  ({ children, onSubmit, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn("relative rounded-lg border bg-background", className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

AIInput.displayName = "AIInput";

type AIInputTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const AIInputTextarea = React.forwardRef<HTMLTextAreaElement, AIInputTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          "min-h-[60px] resize-none border-0 p-4 shadow-none focus-visible:ring-0",
          className
        )}
        {...props}
      />
    );
  }
);

AIInputTextarea.displayName = "AIInputTextarea";

const AIInputToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between border-t p-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AIInputToolbar.displayName = "AIInputToolbar";

const AIInputTools = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AIInputTools.displayName = "AIInputTools";

interface AIInputButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost";
}

const AIInputButton = React.forwardRef<HTMLButtonElement, AIInputButtonProps>(
  ({ children, className, variant = "ghost", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        size="sm"
        className={cn("h-8", className)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AIInputButton.displayName = "AIInputButton";

interface AIInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: AIInputStatus;
}

const AIInputSubmit = React.forwardRef<HTMLButtonElement, AIInputSubmitProps>(
  ({ className, status = "ready", disabled, ...props }, ref) => {
    const isLoading = status === "streaming" || status === "submitted";
    
    return (
      <Button
        ref={ref}
        type="submit"
        size="sm"
        disabled={disabled || isLoading}
        className={cn("h-8", className)}
        {...props}
      >
        {isLoading ? (
          status === "streaming" ? (
            <>
              <Square className="h-3 w-3" />
              <span className="sr-only">Stop</span>
            </>
          ) : (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="sr-only">Sending</span>
            </>
          )
        ) : (
          <>
            <Send className="h-3 w-3" />
            <span className="sr-only">Send</span>
          </>
        )}
      </Button>
    );
  }
);

AIInputSubmit.displayName = "AIInputSubmit";

const AIInputModelSelect = React.forwardRef<
  React.ElementRef<typeof Select>,
  React.ComponentPropsWithoutRef<typeof Select>
>(({ children, ...props }, ref) => {
  return (
    <Select {...props}>
      {children}
    </Select>
  );
});

AIInputModelSelect.displayName = "AIInputModelSelect";

const AIInputModelSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectTrigger
      ref={ref}
      className={cn("h-8 w-auto gap-2 border-0 shadow-none", className)}
      {...props}
    >
      {children}
    </SelectTrigger>
  );
});

AIInputModelSelectTrigger.displayName = "AIInputModelSelectTrigger";

const AIInputModelSelectValue = React.forwardRef<
  React.ElementRef<typeof SelectValue>,
  React.ComponentPropsWithoutRef<typeof SelectValue>
>(({ ...props }, ref) => {
  return <SelectValue {...props} />;
});

AIInputModelSelectValue.displayName = "AIInputModelSelectValue";

const AIInputModelSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectContent>,
  React.ComponentPropsWithoutRef<typeof SelectContent>
>(({ children, ...props }, ref) => {
  return (
    <SelectContent {...props}>
      {children}
    </SelectContent>
  );
});

AIInputModelSelectContent.displayName = "AIInputModelSelectContent";

const AIInputModelSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(({ className, children, ...props }, ref) => {
  return (
    <SelectItem
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </SelectItem>
  );
});

AIInputModelSelectItem.displayName = "AIInputModelSelectItem";

export {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
  AIInputButton,
  AIInputSubmit,
  AIInputModelSelect,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  type AIInputProps,
  type AIInputTextareaProps,
  type AIInputButtonProps,
  type AIInputSubmitProps,
  type AIInputStatus,
};