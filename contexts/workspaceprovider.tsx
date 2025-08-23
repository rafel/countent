"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { StripeSubscription } from "@/lib/db/tables/stripe";
import { WorkspaceWithStripeSubscription } from "@/lib/db/tables/workspace";

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

interface WorkspaceContextType {
  workspace: WorkspaceWithStripeSubscription;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface WorkspaceProviderProps {
  children: React.ReactNode;
  initialData: WorkspaceWithStripeSubscription;
}

export function WorkspaceProvider({
  children,
  initialData,
}: WorkspaceProviderProps) {
  const [workspace, setWorkspace] =
    useState<WorkspaceWithStripeSubscription>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionAccess = useCallback(async () => {
    if (!workspace) return;

    try {
      setError(null);
      setIsLoading(true);

      // Use POST for refetch to avoid caching issues and indicate data mutation intent
      const response = await fetch(`/api/stripe/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          workspaceid: workspace.workspaceid,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch subscription access: ${response.statusText}`
        );
      }

      const data = await response.json();
      setWorkspace(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching subscription access:", err);
    } finally {
      setIsLoading(false);
    }
  }, [workspace]);

  const contextValue: WorkspaceContextType = {
    workspace,
    isLoading,
    error,
    refetch: fetchSubscriptionAccess,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error(
      "useWorkspaceContext must be used within a WorkspaceProvider"
    );
  }
  return context;
}
