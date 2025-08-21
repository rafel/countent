"use client";

import type {
  CheckoutSessionRequest,
  PortalSessionRequest,
} from "./stripe-types";

// Client-side utility functions for Stripe API calls

export async function createCheckoutSession(data: CheckoutSessionRequest) {
  try {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export async function createPortalSession(data: PortalSessionRequest) {
  try {
    const response = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to create portal session");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating portal session:", error);
    throw error;
  }
}

// Helper function to redirect to Stripe Checkout
export async function redirectToCheckout(
  checkoutSessionRequest: CheckoutSessionRequest
) {
  try {
    const { url } = await createCheckoutSession(checkoutSessionRequest);

    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No checkout URL returned");
    }
  } catch (error) {
    console.error("Error redirecting to checkout:", error);
    throw error;
  }
}

// Helper function to redirect to Stripe Billing Portal
export async function redirectToPortal(
  portalSessionRequest: PortalSessionRequest
) {
  try {
    const { url } = await createPortalSession(portalSessionRequest);

    if (url) {
      window.location.href = url;
    } else {
      throw new Error("No portal URL returned");
    }
  } catch (error) {
    console.error("Error redirecting to portal:", error);
    throw error;
  }
}

// Helper function to manually sync subscription data from Stripe
export async function syncSubscriptions(companyId?: string) {
  try {
    const response = await fetch("/api/stripe/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        company_id: companyId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to sync subscriptions");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error syncing subscriptions:", error);
    throw error;
  }
}
