"use client";

import useSWR from "swr";
import type { SubscriptionAccess } from "@/lib/subscription/subscription-access";

/**
 * Client-safe hook to fetch subscription access data
 * Uses API route instead of direct database access
 */
export function useSubscriptionAccess(userId: string, companyId?: string) {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionAccess>(
    userId ? [`/api/subscription/access`, userId, companyId] : null,
    async ([url, userId, companyId]: [string, string, string?]) => {
      const params = new URLSearchParams();
      if (companyId) {
        params.set("companyId", companyId);
      }
      
      const response = await fetch(`${url}?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subscription access: ${response.statusText}`);
      }
      
      return response.json();
    },
    {
      // Cache for 30 seconds to avoid excessive API calls
      dedupingInterval: 30000,
      // Revalidate on focus to ensure fresh data
      revalidateOnFocus: true,
    }
  );

  return {
    subscriptionAccess: data,
    isLoading,
    error,
    mutate,
  };
}
