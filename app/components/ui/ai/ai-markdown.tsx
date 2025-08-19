"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Copy, Check } from "lucide-react";

interface AIMarkdownProps {
  content: string;
  className?: string;
  showCopyButton?: boolean;
}

const AIMarkdown = React.forwardRef<HTMLDivElement, AIMarkdownProps>(
  ({ content, className, showCopyButton = true, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    // Simple markdown-like rendering
    const renderContent = (text: string) => {
      // Split by code blocks first
      const parts = text.split(/(```[\s\S]*?```)/g);
      
      return parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          // Code block
          const code = part.slice(3, -3);
          const lines = code.split("\n");
          const codeContent = lines.slice(1).join("\n").trim();
          
          return (
            <div key={index} className="relative my-4">
              <pre className="overflow-x-auto rounded-lg bg-muted p-4">
                <code className="text-sm">{codeContent}</code>
              </pre>
              {showCopyButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-2 h-6 w-6 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          );
        }

        // Regular text with inline formatting
        return (
          <div key={index}>
            {part
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/`(.*?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm">$1</code>')
              .split('\n')
              .map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>
                  <span dangerouslySetInnerHTML={{ __html: line }} />
                  {lineIndex < part.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
          </div>
        );
      });
    };

    return (
      <div
        ref={ref}
        className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
        {...props}
      >
        {renderContent(content)}
      </div>
    );
  }
);

AIMarkdown.displayName = "AIMarkdown";

export { AIMarkdown, type AIMarkdownProps };
