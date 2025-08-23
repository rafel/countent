"use client";

import { useSubscriptionContext } from "@/contexts/subscriptionprovider";

/**
 * Hook to access subscription data from context
 * Uses the SubscriptionProvider context which has server-side initial data
 * No parameters needed - context provides all data from layout
 */
export function useSubscriptionAccess() {
  return useSubscriptionContext();
}
