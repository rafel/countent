/**
 * Extended Stripe types for properties not included in the official TypeScript definitions
 * These properties exist in the actual Stripe API responses but are not typed
 */

import type Stripe from "stripe";

// Extended Subscription type with additional properties
export interface StripeSubscriptionExtended extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

// Extended Invoice type with additional properties  
export interface StripeInvoiceExtended extends Stripe.Invoice {
  subscription?: string | Stripe.Subscription;
}

// Type guard to check if subscription has extended properties
export function isExtendedSubscription(
  subscription: Stripe.Subscription
): subscription is StripeSubscriptionExtended {
  return 'current_period_start' in subscription && 'current_period_end' in subscription;
}

// Helper function to safely access subscription period properties
export function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const extended = subscription as StripeSubscriptionExtended;
  return {
    current_period_start: extended.current_period_start || null,
    current_period_end: extended.current_period_end || null,
  };
}

// Helper function to safely access invoice subscription
export function getInvoiceSubscription(invoice: Stripe.Invoice): string | null {
  const extended = invoice as StripeInvoiceExtended;
  if (typeof extended.subscription === 'string') {
    return extended.subscription;
  }
  if (extended.subscription && typeof extended.subscription === 'object') {
    return extended.subscription.id;
  }
  return null;
}
