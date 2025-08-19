"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";

interface AISuggestionProps {
  children?: React.ReactNode;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
  title?: string;
  disabled?: boolean;
}

const AISuggestions = React.forwardRef<HTMLDivElement, AISuggestionProps>(
  ({ children, suggestions, onSuggestionClick, className, title, disabled = false, ...props }, ref) => {
    // If children are provided, use the new component pattern
    if (children) {
      return (
        <div ref={ref} className={cn("space-y-3", className)} {...props}>
          {title && (
            <h4 className="text-sm font-medium text-muted-foreground">
              {title}
            </h4>
          )}
          <div className="flex flex-wrap gap-2">
            {children}
          </div>
        </div>
      );
    }

    // Legacy support for suggestions prop
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        {title && (
          <h4 className="text-sm font-medium text-muted-foreground">
            {title}
          </h4>
        )}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick?.(suggestion)}
              disabled={disabled}
              className="h-auto whitespace-normal text-left justify-start p-3"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    );
  }
);

AISuggestions.displayName = "AISuggestions";

interface AISuggestionCardProps {
  title: string;
  description?: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
  disabled?: boolean;
}

const AISuggestionCard = React.forwardRef<HTMLDivElement, AISuggestionCardProps>(
  ({ title, description, suggestions, onSuggestionClick, className, disabled = false, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn("p-4", className)} {...props}>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <AISuggestions
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
            disabled={disabled}
          />
        </div>
      </Card>
    );
  }
);

AISuggestionCard.displayName = "AISuggestionCard";

interface AISuggestionItemProps {
  suggestion: string;
  onClick?: (suggestion: string) => void;
  className?: string;
  disabled?: boolean;
}

const AISuggestion = React.forwardRef<HTMLButtonElement, AISuggestionItemProps>(
  ({ suggestion, onClick, className, disabled = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        onClick={() => onClick?.(suggestion)}
        disabled={disabled}
        className={cn("h-auto whitespace-normal text-left justify-start p-3", className)}
        {...props}
      >
        {suggestion}
      </Button>
    );
  }
);

AISuggestion.displayName = "AISuggestion";

export { 
  AISuggestions, 
  AISuggestion,
  AISuggestionCard, 
  type AISuggestionProps, 
  type AISuggestionItemProps,
  type AISuggestionCardProps 
};