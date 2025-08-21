import "server-only";
import Stripe from "stripe";
import {
  type CheckoutSessionRequest,
  type PortalSessionRequest,
} from "./stripe-types";

import {
  STRIPE_PRICE_LOOKUP_KEYS,
  type StripePriceLookupKey,
} from "@/content/common";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Re-export constants for server-side use
export {
  STRIPE_PRICE_LOOKUP_KEYS,
  type StripePriceLookupKey,
  type CheckoutSessionRequest,
  type PortalSessionRequest,
};

// Helper function to get customer by email
export async function getCustomerByEmail(
  email: string
): Promise<Stripe.Customer | null> {
  try {
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data[0] || null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
}

// Helper function to get active subscription for customer
export async function getActiveSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    return subscriptions.data[0] || null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
}

// Helper function to create or get customer
export async function createOrGetCustomer(
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  let customer = await getCustomerByEmail(email);

  if (!customer) {
    customer = await stripe.customers.create({
      email,
      name,
    });
  }

  return customer;
}
