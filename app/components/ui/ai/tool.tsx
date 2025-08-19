"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/app/components/ui/collapsible";
import { ChevronDown, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

type AIToolStatus = "pending" | "running" | "completed" | "error";

interface AIToolProps {
  children: React.ReactNode;
  className?: string;
}

const AITool = React.forwardRef<HTMLDivElement, AIToolProps>(
  ({ children, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Card ref={ref} className={cn("mb-4", className)} {...props}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {children}
        </Collapsible>
      </Card>
    );
  }
);

AITool.displayName = "AITool";

interface AIToolHeaderProps {
  name: string;
  description?: string;
  status: AIToolStatus;
  className?: string;
}

const AIToolHeader = React.forwardRef<HTMLDivElement, AIToolHeaderProps>(
  ({ name, description, status, className, ...props }, ref) => {
    const getStatusIcon = () => {
      switch (status) {
        case "completed":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "error":
          return <XCircle className="h-4 w-4 text-red-500" />;
        case "running":
          return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
        case "pending":
          return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      }
    };

    const getStatusColor = () => {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "error":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        case "running":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      }
    };

    return (
      <CollapsibleTrigger asChild>
        <div
          ref={ref}
          className={cn(
            "flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{name}</span>
                <Badge variant="secondary" className={cn("text-xs", getStatusColor())}>
                  {status}
                </Badge>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
    );
  }
);

AIToolHeader.displayName = "AIToolHeader";

const AIToolContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <CollapsibleContent>
        <div
          ref={ref}
          className={cn("space-y-4 border-t p-4", className)}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContent>
    );
  }
);

AIToolContent.displayName = "AIToolContent";

interface AIToolParametersProps {
  parameters: Record<string, unknown>;
  className?: string;
}

const AIToolParameters = React.forwardRef<HTMLDivElement, AIToolParametersProps>(
  ({ parameters, className, ...props }, ref) => {
    if (!parameters || Object.keys(parameters).length === 0) {
      return null;
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <h4 className="text-sm font-medium">Parameters</h4>
        <div className="rounded-lg bg-muted p-3">
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(parameters, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
);

AIToolParameters.displayName = "AIToolParameters";

interface AIToolResultProps {
  result?: string;
  error?: string;
  className?: string;
}

const AIToolResult = React.forwardRef<HTMLDivElement, AIToolResultProps>(
  ({ result, error, className, ...props }, ref) => {
    if (!result && !error) {
      return null;
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <h4 className="text-sm font-medium">
          {error ? "Error" : "Result"}
        </h4>
        <div className={cn(
          "rounded-lg p-3",
          error 
            ? "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800" 
            : "bg-muted"
        )}>
          <pre className={cn(
            "text-xs whitespace-pre-wrap",
            error ? "text-red-700 dark:text-red-300" : "text-muted-foreground"
          )}>
            {error || result}
          </pre>
        </div>
      </div>
    );
  }
);

AIToolResult.displayName = "AIToolResult";

export {
  AITool,
  AIToolHeader,
  AIToolContent,
  AIToolParameters,
  AIToolResult,
  type AIToolProps,
  type AIToolHeaderProps,
  type AIToolParametersProps,
  type AIToolResultProps,
  type AIToolStatus,
};