"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SubscriptionAccess } from "@/lib/db/tables/subscription";

interface SubscriptionContextType {
  subscriptionAccess: SubscriptionAccess | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: React.ReactNode;
  userId: string;
  companyId?: string;
  initialData?: SubscriptionAccess; // Server-side data to prevent flicker
}

export function SubscriptionProvider({
  children,
  userId,
  companyId,
  initialData,
}: SubscriptionProviderProps) {
  console.log("🚀 SubscriptionProvider: Initializing", { 
    userId, 
    companyId, 
    hasInitialData: !!initialData 
  });

  const [subscriptionAccess, setSubscriptionAccess] = useState<SubscriptionAccess | null>(
    initialData || null
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionAccess = useCallback(async () => {
    if (!userId) return;

    console.log("🔄 SubscriptionProvider: Manual refetch called", { userId, companyId });

    try {
      setError(null);
      setIsLoading(true);

      // Use POST for refetch to avoid caching issues and indicate data mutation intent
      const response = await fetch(`/api/subscription/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId,
          companyId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription access: ${response.statusText}`);
      }

      const data = await response.json();
      setSubscriptionAccess(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching subscription access:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, companyId]);


  const contextValue: SubscriptionContextType = {
    subscriptionAccess,
    isLoading,
    error,
    refetch: fetchSubscriptionAccess,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscriptionContext must be used within a SubscriptionProvider"
    );
  }
  return context;
}
