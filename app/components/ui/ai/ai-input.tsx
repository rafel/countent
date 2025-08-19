"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Send, Paperclip, Mic, Square } from "lucide-react";

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onStop?: () => void;
  onAttach?: () => void;
  onVoiceInput?: () => void;
  maxLength?: number;
  className?: string;
}

const AIInput = React.forwardRef<HTMLDivElement, AIInputProps>(
  ({
    value,
    onChange,
    onSubmit,
    placeholder = "Type your message...",
    disabled = false,
    loading = false,
    onStop,
    onAttach,
    onVoiceInput,
    maxLength,
    className,
    ...props
  }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    React.useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "inherit";
        textareaRef.current.style.height = `${Math.max(
          40,
          Math.min(textareaRef.current.scrollHeight, 200)
        )}px`;
      }
    }, [value]);

    const handleSubmit = () => {
      if (value.trim() && !disabled && !loading) {
        onSubmit(value);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const canSubmit = value.trim().length > 0 && !disabled && !loading;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-end gap-2 rounded-lg border bg-background p-3",
          className
        )}
        {...props}
      >
        {/* Attachment button */}
        {onAttach && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAttach}
            disabled={disabled || loading}
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
        )}

        {/* Input area */}
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            maxLength={maxLength}
            className="min-h-[40px] resize-none border-0 p-0 shadow-none focus-visible:ring-0"
            style={{ height: "40px" }}
          />
          {maxLength && (
            <div className="text-xs text-muted-foreground text-right">
              {value.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice input button */}
        {onVoiceInput && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onVoiceInput}
            disabled={disabled || loading}
            className="shrink-0"
          >
            <Mic className="h-4 w-4" />
            <span className="sr-only">Voice input</span>
          </Button>
        )}

        {/* Submit/Stop button */}
        {loading && onStop ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="shrink-0"
          >
            <Square className="h-4 w-4" />
            <span className="sr-only">Stop</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        )}
      </div>
    );
  }
);

AIInput.displayName = "AIInput";

export { AIInput, type AIInputProps };