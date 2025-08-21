import {
  getUserActiveSubscriptions,
  getCompanyActiveSubscriptions,
  getUserAllSubscriptions,
  getCompanySubscriptions,
} from "@/lib/db/queries/subscription";
import {
  subscriptionPlans,
  type SubscriptionFeatures,
  type SubscriptionPlans,
  STRIPE_PRICE_LOOKUP_KEYS,
  type StripePriceLookupKey,
} from "@/content/common";

export interface SubscriptionAccess {
  hasAccess: boolean;
  features: SubscriptionFeatures | null;
  reason: "owner" | "granted" | "company_covered" | "none";
  subscriptionId?: string;
  plan: string;
  hasHistoricalSubscriptions: boolean; // New field to check if user ever had subscriptions
}

/**
 * Check if user has subscription access for a specific context
 * This is the main function to use throughout the app
 */
export async function checkSubscriptionAccess(
  userId: string,
  companyId?: string
): Promise<SubscriptionAccess> {
  try {
    // 1. Check if user has direct subscription access (owner or granted)
    const userSubs = await getUserActiveSubscriptions(userId);

    if (userSubs.length > 0) {
      // User has at least one active subscription
      const bestSub = userSubs[0]; // Take the first (most recent) subscription
      const planKey = bestSub.plan as SubscriptionPlans;
      const features = subscriptionPlans[planKey]?.features || subscriptionPlans.free.features;

      return {
        hasAccess: true,
        features,
        reason: "owner", // Could be owner or granted, but they have direct access
        subscriptionId: bestSub.subscriptionid,
        plan: bestSub.plan,
        hasHistoricalSubscriptions: true,
      };
    }

    // 2. If accessing a specific company, check if company has subscription coverage
    if (companyId) {
      const companySubs = await getCompanyActiveSubscriptions(companyId);

      if (companySubs.length > 0) {
        const bestSub = companySubs[0];
        const planKey = bestSub.plan as SubscriptionPlans;
        const features = subscriptionPlans[planKey]?.features || subscriptionPlans.free.features;

        return {
          hasAccess: true,
          features,
          reason: "company_covered",
          subscriptionId: bestSub.subscriptionid,
          plan: bestSub.plan,
          hasHistoricalSubscriptions: true,
        };
      }
    }

    // 3. Check for historical subscriptions (for billing history access)
    let hasHistoricalSubscriptions = false;
    
    // Check user's historical subscriptions
    const allUserSubs = await getUserAllSubscriptions(userId);
    if (allUserSubs.length > 0) {
      hasHistoricalSubscriptions = true;
    }
    
    // Check company's historical subscriptions if applicable
    if (!hasHistoricalSubscriptions && companyId) {
      const allCompanySubs = await getCompanySubscriptions(companyId);
      if (allCompanySubs.length > 0) {
        hasHistoricalSubscriptions = true;
      }
    }

    // 4. No access found - default to free plan
    const freeFeatures = subscriptionPlans.free.features;
    return {
      hasAccess: false,
      features: freeFeatures,
      reason: "none",
      plan: "free",
      hasHistoricalSubscriptions,
    };
  } catch (error) {
    console.error("Error checking subscription access:", error);
    // Fallback to free plan on error
    const freeFeatures = subscriptionPlans.free.features;
    return {
      hasAccess: false,
      features: freeFeatures,
      reason: "none",
      plan: "free",
      hasHistoricalSubscriptions: false,
    };
  }
}

/**
 * Check if user can perform a specific action based on subscription limits
 */
export async function checkFeatureLimit(
  userId: string,
  feature: keyof SubscriptionFeatures,
  currentUsage: number,
  companyId?: string
): Promise<{ allowed: boolean; limit: number | boolean; reason: string }> {
  const access = await checkSubscriptionAccess(userId, companyId);

  if (!access.hasAccess || !access.features) {
    return {
      allowed: false,
      limit: 0,
      reason: "No active subscription",
    };
  }

  const limit = access.features[feature];

  // Handle boolean features (like prioritySupport)
  if (typeof limit === "boolean") {
    return {
      allowed: limit,
      limit,
      reason: limit ? "Feature enabled" : "Feature not included in plan",
    };
  }

  // Handle numeric limits
  if (typeof limit === "number") {
    const unlimited = limit === -1;
    const withinLimit = unlimited || currentUsage < limit;

    return {
      allowed: withinLimit,
      limit,
      reason: unlimited
        ? "Unlimited usage"
        : withinLimit
        ? `Within limit (${currentUsage}/${limit})`
        : `Limit exceeded (${currentUsage}/${limit})`,
    };
  }

  return {
    allowed: false,
    limit,
    reason: "Unknown feature type",
  };
}

/**
 * Get the best subscription plan for a user (highest tier they have access to)
 */
export async function getUserBestSubscription(
  userId: string,
  companyId?: string
): Promise<{ plan: string; features: SubscriptionFeatures } | null> {
  const access = await checkSubscriptionAccess(userId, companyId);

  if (!access.hasAccess || !access.features) {
    return null;
  }

  // You could implement plan hierarchy logic here if needed
  // For now, just return the first active subscription
  const userSubs = await getUserActiveSubscriptions(userId);
  if (userSubs.length > 0) {
    return {
      plan: userSubs[0].plan,
      features: access.features,
    };
  }

  if (companyId) {
    const companySubs = await getCompanyActiveSubscriptions(companyId);
    if (companySubs.length > 0) {
      return {
        plan: companySubs[0].plan,
        features: access.features,
      };
    }
  }

  return null;
}

export function getSubscriptionFeatures(
  plan: SubscriptionPlans
): SubscriptionFeatures {
  const planFeatures = subscriptionPlans[plan];
  if (!planFeatures) {
    throw new Error(`Unknown subscription plan: ${plan}`);
  }

  return planFeatures.features;
}

// Helper function to check if a feature is unlimited
export function isUnlimited(value: number): boolean {
  return value === -1;
}

// Helper function to check if usage is within limits
export function isWithinLimit(current: number, limit: number): boolean {
  if (isUnlimited(limit)) return true;
  return current < limit;
}



// ============================================================================
// SMART UTILITY FUNCTIONS
// ============================================================================

/**
 * Get subscription plan from Stripe price lookup key
 */
export function getPlanFromLookupKey(
  lookupKey: StripePriceLookupKey
): SubscriptionPlans | null {
  for (const [planName, planData] of Object.entries(subscriptionPlans)) {
    if (
      planData.pricing?.monthly?.stripeLookupKey === lookupKey ||
      planData.pricing?.yearly?.stripeLookupKey === lookupKey
    ) {
      return planName as SubscriptionPlans;
    }
  }
  return null;
}

/**
 * Get lookup key from plan and billing interval
 */
export function getLookupKeyFromPlan(
  plan: SubscriptionPlans,
  interval: "monthly" | "yearly"
): StripePriceLookupKey | null {
  const planData = subscriptionPlans[plan];
  return planData.pricing?.[interval]?.stripeLookupKey || null;
}

/**
 * Get price from plan and billing interval
 */
export function getPriceFromPlan(
  plan: SubscriptionPlans,
  interval: "monthly" | "yearly"
): number | null {
  const planData = subscriptionPlans[plan];
  return planData.pricing?.[interval]?.price || null;
}

/**
 * Get all available pricing for a plan
 */
export function getPlanPricing(plan: SubscriptionPlans): {
  monthly?: { price: number; stripeLookupKey: StripePriceLookupKey };
  yearly?: { price: number; stripeLookupKey: StripePriceLookupKey };
} {
  const planData = subscriptionPlans[plan];
  return {
    monthly: planData.pricing?.monthly,
    yearly: planData.pricing?.yearly,
  };
}

/**
 * Check if a lookup key is valid
 */
export function isValidLookupKey(stripeLookupKey: StripePriceLookupKey): boolean {
  return Object.values(STRIPE_PRICE_LOOKUP_KEYS).includes(
    stripeLookupKey as StripePriceLookupKey
  );
}

/**
 * Get billing interval from lookup key
 */
export function getBillingIntervalFromLookupKey(
  stripeLookupKey: StripePriceLookupKey
): "monthly" | "yearly" | null {
  if (stripeLookupKey.includes("monthly")) return "monthly";
  if (stripeLookupKey.includes("yearly")) return "yearly";
  return null;
}

/**
 * Get all available plans with their pricing (useful for UI)
 */
export function getAvailablePlansWithPricing() {
  return Object.entries(subscriptionPlans)
    .filter(([, planData]) => planData.pricing) // Only plans with Stripe integration
    .map(([planName, planData]) => ({
      plan: planName as SubscriptionPlans,
      name: planName.charAt(0).toUpperCase() + planName.slice(1),
      ...planData,
    }));
}

/**
 * Calculate yearly discount percentage
 */
export function getYearlyDiscount(plan: SubscriptionPlans): number | null {
  const pricing = getPlanPricing(plan);
  if (!pricing.monthly || !pricing.yearly) return null;

  const monthlyTotal = pricing.monthly.price * 12;
  const yearlyPrice = pricing.yearly.price;
  const discount = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;

  return Math.round(discount);
}

/**
 * Get all lookup keys for easy validation
 */
export function getAllStripeLookupKeys(): StripePriceLookupKey[] {
  return Object.values(STRIPE_PRICE_LOOKUP_KEYS);
}
