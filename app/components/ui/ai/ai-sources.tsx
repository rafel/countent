"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/app/components/ui/collapsible";
import { ExternalLink, FileText, Link, Globe, ChevronDown, BookOpen } from "lucide-react";

interface Source {
  id: string;
  title: string;
  url: string;
  description?: string;
  type?: "web" | "document" | "internal";
  favicon?: string;
}

interface AISourcesProps {
  children?: React.ReactNode;
  sources?: Source[];
  className?: string;
  title?: string;
  maxSources?: number;
  showIcons?: boolean;
}

const AISources = React.forwardRef<HTMLDivElement, AISourcesProps>(
  ({ 
    children,
    sources, 
    className, 
    title = "Sources", 
    maxSources, 
    showIcons = true, 
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // If children are provided, use the new component pattern
    if (children) {
      return (
        <div ref={ref} className={cn("mb-4", className)} {...props}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {children}
          </Collapsible>
        </div>
      );
    }

    // Legacy support for sources prop
    if (!sources || sources.length === 0) return null;

    const displaySources = maxSources ? sources.slice(0, maxSources) : sources;

    const getSourceIcon = (type: Source["type"]) => {
      switch (type) {
        case "web":
          return <Globe className="h-3 w-3" />;
        case "document":
          return <FileText className="h-3 w-3" />;
        case "internal":
          return <Link className="h-3 w-3" />;
        default:
          return <ExternalLink className="h-3 w-3" />;
      }
    };

    const getSourceTypeLabel = (type: Source["type"]) => {
      switch (type) {
        case "web":
          return "Web";
        case "document":
          return "Doc";
        case "internal":
          return "Internal";
        default:
          return "Link";
      }
    };

    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            {title}
          </h4>
          <Badge variant="secondary" className="text-xs">
            {sources.length}
          </Badge>
        </div>

        <div className="grid gap-2">
          {displaySources.map((source) => (
            <Card key={source.id} className="p-3">
              <div className="flex items-start gap-3">
                {showIcons && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-background">
                    {source.favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={source.favicon}
                        alt=""
                        className="h-4 w-4 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      getSourceIcon(source.type)
                    )}
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-left font-medium"
                      asChild
                    >
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-1"
                      >
                        {source.title}
                      </a>
                    </Button>
                    {source.type && (
                      <Badge variant="outline" className="text-xs">
                        {getSourceTypeLabel(source.type)}
                      </Badge>
                    )}
                  </div>

                  {source.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {source.description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground truncate">
                    {new URL(source.url).hostname}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 shrink-0"
                  asChild
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">Open source</span>
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {maxSources && sources.length > maxSources && (
          <p className="text-xs text-muted-foreground text-center">
            +{sources.length - maxSources} more sources
          </p>
        )}
      </div>
    );
  }
);

AISources.displayName = "AISources";

interface AISourcesTriggerProps {
  count: number;
  className?: string;
}

const AISourcesTrigger = React.forwardRef<HTMLButtonElement, AISourcesTriggerProps>(
  ({ count, className, ...props }, ref) => {
    return (
      <CollapsibleTrigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-auto items-center gap-2 p-2 text-xs text-muted-foreground hover:text-foreground",
            className
          )}
          {...props}
        >
          <BookOpen className="h-3 w-3" />
          <span>{count} source{count !== 1 ? 's' : ''}</span>
          <ChevronDown className="h-3 w-3 transition-transform data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
    );
  }
);

AISourcesTrigger.displayName = "AISourcesTrigger";

const AISourcesContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <CollapsibleContent>
        <div
          ref={ref}
          className={cn("space-y-2 pt-2", className)}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContent>
    );
  }
);

AISourcesContent.displayName = "AISourcesContent";

interface AISourceProps {
  href: string;
  title: string;
  className?: string;
}

const AISource = React.forwardRef<HTMLAnchorElement, AISourceProps>(
  ({ href, title, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 rounded-md border p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
          className
        )}
        {...props}
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="truncate">{title}</span>
      </a>
    );
  }
);

AISource.displayName = "AISource";

export { 
  AISources, 
  AISourcesTrigger,
  AISourcesContent,
  AISource,
  type AISourcesProps, 
  type AISourcesTriggerProps,
  type AISourceProps,
  type Source 
};