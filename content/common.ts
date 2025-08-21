export const commonSettings = {
  Logo: "/logo.svg",
  LogoDark: "/logo-dark.svg",
  siteTitle: "Countant - AI Accountant",
  siteDescription: "We Do AI",
  siteKeywords: "Countant, AI, Accountant, AI Accountant",
  siteUrl: "https://countant.ai",
  siteImage: "/logo.svg",
  siteImageDark: "/logo-dark.svg",
  siteImageWidth: 1200,
  siteImageHeight: 630,
  subscriptionModel: "b2b" as SubscriptionModels,
};

export type SubscriptionModels = "b2c" | "b2b";

export type SubscriptionPlans = "free" | "pro" | "ultra" | "enterprise";

// Stripe price lookup keys
export const STRIPE_PRICE_LOOKUP_KEYS = {
  PRO_MONTHLY: "pro_monthly",
  PRO_YEARLY: "pro_yearly",
  ULTRA_MONTHLY: "ultra_monthly",
  ULTRA_YEARLY: "ultra_yearly",
  ENTERPRISE_MONTHLY: "enterprise_monthly",
  ENTERPRISE_YEARLY: "enterprise_yearly",
} as const;

export type StripePriceLookupKey =
  (typeof STRIPE_PRICE_LOOKUP_KEYS)[keyof typeof STRIPE_PRICE_LOOKUP_KEYS];

export interface SubscriptionFeatures {
  maxApiCalls: number;
  maxCompanies: number;
  maxUsers: number;
  maxProjects: number;
  maxStorage: number;
  prioritySupport: boolean;
  advancedFeatures: boolean;
  customIntegrations: boolean;
}

export const subscriptionPlans: Record<
  SubscriptionPlans,
  {
    id: string;
    currency: string;
    features: SubscriptionFeatures;
    pricing?: {
      monthly?: {
        price: number;
        stripeLookupKey: StripePriceLookupKey;
      };
      yearly?: {
        price: number;
        stripeLookupKey: StripePriceLookupKey;
      };
    };
  }
> = {
  free: {
    id: "free",
    currency: "usd",
    features: {
      maxApiCalls: 100,
      maxCompanies: 1,
      maxUsers: 1,
      maxProjects: 1,
      maxStorage: 1,
      prioritySupport: false,
      advancedFeatures: false,
      customIntegrations: false,
    },
    // No pricing - free plan has no Stripe integration
  },
  pro: {
    id: "pro",
    currency: "usd",
    features: {
      maxApiCalls: 1000,
      maxCompanies: 3,
      maxUsers: 5,
      maxProjects: 10,
      maxStorage: 10,
      prioritySupport: true,
      advancedFeatures: true,
      customIntegrations: false,
    },
    pricing: {
      monthly: {
        price: 10,
        stripeLookupKey:
          STRIPE_PRICE_LOOKUP_KEYS.PRO_MONTHLY as StripePriceLookupKey,
      },
      yearly: {
        price: 100, // 10 * 12 - 20% discount
        stripeLookupKey:
          STRIPE_PRICE_LOOKUP_KEYS.PRO_YEARLY as StripePriceLookupKey,
      },
    },
  },
  ultra: {
    id: "ultra",
    currency: "usd",
    features: {
      maxApiCalls: 10000,
      maxCompanies: 10,
      maxUsers: 25,
      maxProjects: 50,
      maxStorage: 100,
      prioritySupport: true,
      advancedFeatures: true,
      customIntegrations: true,
    },
    pricing: {
      monthly: {
        price: 25,
        stripeLookupKey:
          STRIPE_PRICE_LOOKUP_KEYS.ULTRA_MONTHLY as StripePriceLookupKey,
      },
      yearly: {
        price: 250, // 25 * 12 - 17% discount
        stripeLookupKey:
          STRIPE_PRICE_LOOKUP_KEYS.ULTRA_YEARLY as StripePriceLookupKey,
      },
    },
  },
  enterprise: {
    id: "enterprise",
    currency: "usd",
    features: {
      maxApiCalls: -1, // Unlimited
      maxCompanies: -1, // Unlimited
      maxUsers: -1, // Unlimited
      maxProjects: -1, // Unlimited
      maxStorage: -1, // Unlimited
      prioritySupport: true,
      advancedFeatures: true,
      customIntegrations: true,
    },
    pricing: {
      monthly: {
        price: 99,
        stripeLookupKey:
          STRIPE_PRICE_LOOKUP_KEYS.ENTERPRISE_MONTHLY as StripePriceLookupKey,
      },
      yearly: {
        price: 999, // 99 * 12 - 16% discount
        stripeLookupKey:
          STRIPE_PRICE_LOOKUP_KEYS.ENTERPRISE_YEARLY as StripePriceLookupKey,
      },
    },
  },
};
