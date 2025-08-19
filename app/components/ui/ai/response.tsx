"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AIResponseProps {
  children: string;
  className?: string;
}

const AIResponse = React.forwardRef<HTMLDivElement, AIResponseProps>(
  ({ children, className, ...props }, ref) => {
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
            <pre key={index} className="overflow-x-auto rounded-lg bg-muted p-4 my-4">
              <code className="text-sm">{codeContent}</code>
            </pre>
          );
        }

        // Regular text with inline formatting
        const processedText = part
          .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
          .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
          .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm">$1</code>')
          .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
          .replace(/(<li.*<\/li>)/s, '<ul class="list-disc pl-4 space-y-1">$1</ul>');

        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: processedText }}
          />
        );
      });
    };

    return (
      <div
        ref={ref}
        className={cn("text-sm leading-relaxed", className)}
        {...props}
      >
        {renderContent(children)}
      </div>
    );
  }
);

AIResponse.displayName = "AIResponse";

export { AIResponse, type AIResponseProps };
