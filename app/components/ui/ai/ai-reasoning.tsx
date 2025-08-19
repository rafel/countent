"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/app/components/ui/collapsible";
import { ChevronDown, Brain, Lightbulb } from "lucide-react";

interface ReasoningStep {
  id: string;
  title: string;
  content: string;
  type?: "thinking" | "analysis" | "conclusion";
}

interface AIReasoningProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  steps?: ReasoningStep[];
  title?: string;
  defaultOpen?: boolean;
  showStepIcons?: boolean;
}

const AIReasoning = React.forwardRef<HTMLDivElement, AIReasoningProps>(
  ({ 
    children,
    duration,
    steps, 
    className, 
    title = "Reasoning", 
    defaultOpen = false, 
    showStepIcons = true,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    // If children are provided, use the new component pattern
    if (children) {
      return (
        <Card ref={ref} className={cn("mb-4", className)} {...props}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {children}
          </Collapsible>
        </Card>
      );
    }

    // Legacy support for steps prop
    if (!steps || steps.length === 0) return null;

    const getStepIcon = (type: ReasoningStep["type"]) => {
      switch (type) {
        case "thinking":
          return <Brain className="h-3 w-3" />;
        case "analysis":
          return <Lightbulb className="h-3 w-3" />;
        case "conclusion":
          return <ChevronDown className="h-3 w-3" />;
        default:
          return <Brain className="h-3 w-3" />;
      }
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full justify-between p-0 h-auto font-medium text-muted-foreground hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                {title}
                <span className="text-xs">({steps.length} steps)</span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            {steps.map((step, index) => (
              <Card key={step.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {index + 1}
                    </span>
                    {showStepIcons && (
                      <div className="text-muted-foreground">
                        {getStepIcon(step.type)}
                      </div>
                    )}
                    <h4 className="font-medium">{step.title}</h4>
                  </div>
                  <div className="ml-8 text-sm text-muted-foreground whitespace-pre-wrap">
                    {step.content}
                  </div>
                </div>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);

AIReasoning.displayName = "AIReasoning";

interface AIReasoningTriggerProps {
  duration?: number;
  className?: string;
}

const AIReasoningTrigger = React.forwardRef<HTMLDivElement, AIReasoningTriggerProps>(
  ({ duration, className, ...props }, ref) => {
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
            <Brain className="h-4 w-4 text-blue-500" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Reasoning</span>
                {duration && (
                  <Badge variant="secondary" className="text-xs">
                    {duration}s
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">View thinking process</p>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
    );
  }
);

AIReasoningTrigger.displayName = "AIReasoningTrigger";

const AIReasoningContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <CollapsibleContent>
        <div
          ref={ref}
          className={cn("border-t p-4 text-sm text-muted-foreground", className)}
          {...props}
        >
          <div className="whitespace-pre-wrap font-mono text-xs bg-muted/50 p-3 rounded">
            {children}
          </div>
        </div>
      </CollapsibleContent>
    );
  }
);

AIReasoningContent.displayName = "AIReasoningContent";

export { 
  AIReasoning, 
  AIReasoningTrigger,
  AIReasoningContent,
  type AIReasoningProps, 
  type AIReasoningTriggerProps,
  type ReasoningStep 
};