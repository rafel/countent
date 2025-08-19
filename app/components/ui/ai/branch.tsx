"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AIBranchContextValue {
  currentBranch: number;
  totalBranches: number;
  setBranch: (branch: number) => void;
}

const AIBranchContext = React.createContext<AIBranchContextValue | undefined>(
  undefined
);

const useAIBranch = () => {
  const context = React.useContext(AIBranchContext);
  if (!context) {
    throw new Error("useAIBranch must be used within AIBranch");
  }
  return context;
};

interface AIBranchProps {
  children: React.ReactNode;
  defaultBranch?: number;
  className?: string;
}

const AIBranch = React.forwardRef<HTMLDivElement, AIBranchProps>(
  ({ children, defaultBranch = 0, className, ...props }, ref) => {
    const [currentBranch, setCurrentBranch] = React.useState(defaultBranch);
    const [totalBranches, setTotalBranches] = React.useState(0);

    const setBranch = React.useCallback(
      (branch: number) => {
        setCurrentBranch(Math.max(0, Math.min(totalBranches - 1, branch)));
      },
      [totalBranches]
    );

    const registerBranches = React.useCallback((count: number) => {
      setTotalBranches(count);
    }, []);

    React.useEffect(() => {
      const messagesElement = (
        ref as React.RefObject<HTMLDivElement>
      )?.current?.querySelector("[data-ai-branch-messages]");
      if (messagesElement) {
        const count = messagesElement.children.length;
        registerBranches(count);
      }
    }, [children, registerBranches, ref]);

    return (
      <AIBranchContext.Provider
        value={{ currentBranch, totalBranches, setBranch }}
      >
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {children}
        </div>
      </AIBranchContext.Provider>
    );
  }
);

AIBranch.displayName = "AIBranch";

const AIBranchMessages = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { currentBranch } = useAIBranch();
  const childrenArray = React.Children.toArray(children);

  return (
    <div ref={ref} data-ai-branch-messages className={className} {...props}>
      {childrenArray[currentBranch] || childrenArray[0]}
    </div>
  );
});

AIBranchMessages.displayName = "AIBranchMessages";

interface AIBranchSelectorProps {
  from: "user" | "assistant";
  className?: string;
}

const AIBranchSelector = React.forwardRef<
  HTMLDivElement,
  AIBranchSelectorProps
>(({ from, className, ...props }, ref) => {
  const { totalBranches } = useAIBranch();

  if (totalBranches <= 1) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-2 py-2",
        from === "user" && "justify-end",
        className
      )}
      {...props}
    >
      <AIBranchPrevious />
      <AIBranchPage />
      <AIBranchNext />
    </div>
  );
});

AIBranchSelector.displayName = "AIBranchSelector";

const AIBranchPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { currentBranch, setBranch } = useAIBranch();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={() => setBranch(currentBranch - 1)}
      disabled={currentBranch === 0}
      className={cn("h-6 w-6 p-0", className)}
      {...props}
    >
      <ChevronLeft className="h-3 w-3" />
      <span className="sr-only">Previous branch</span>
    </Button>
  );
});

AIBranchPrevious.displayName = "AIBranchPrevious";

const AIBranchNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { currentBranch, totalBranches, setBranch } = useAIBranch();

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      onClick={() => setBranch(currentBranch + 1)}
      disabled={currentBranch >= totalBranches - 1}
      className={cn("h-6 w-6 p-0", className)}
      {...props}
    >
      <ChevronRight className="h-3 w-3" />
      <span className="sr-only">Next branch</span>
    </Button>
  );
});

AIBranchNext.displayName = "AIBranchNext";

const AIBranchPage = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { currentBranch, totalBranches } = useAIBranch();

  return (
    <span
      ref={ref}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {currentBranch + 1} of {totalBranches}
    </span>
  );
});

AIBranchPage.displayName = "AIBranchPage";

export {
  AIBranch,
  AIBranchMessages,
  AIBranchSelector,
  AIBranchPrevious,
  AIBranchNext,
  AIBranchPage,
  type AIBranchProps,
  type AIBranchSelectorProps,
};
