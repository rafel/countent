import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/utils/user";
import { ChatSDKError } from "@/lib/errors";
import { PortalSessionRequest } from "@/lib/stripe/stripe-types";
import {
  getUserAllSubscriptions,
  getCompanySubscriptions,
  getSubscriptionPayerById,
} from "@/lib/db/queries/subscription";
import { commonSettings } from "@/content/common";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:api").toResponse();
    }

    const body: PortalSessionRequest = await request.json();
    const { return_path, company_id } = body;

    // Find the user's subscription to get the Stripe customer ID
    // Check for ANY subscription (active or inactive) since we need billing history
    let subscriptions;

    if (commonSettings.subscriptionModel === "b2b" && company_id) {
      // B2B: Get ALL company subscriptions (including inactive)
      subscriptions = await getCompanySubscriptions(company_id);
    } else {
      // B2C: Get ALL user subscriptions (including inactive)
      subscriptions = await getUserAllSubscriptions(session.user.id);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscription found - no billing history available" },
        { status: 404 }
      );
    }

    // Get the subscription payer to find the Stripe customer ID
    const subscription = subscriptions[0]; // Use the first active subscription
    const payer = await getSubscriptionPayerById(
      subscription.subscriptionpayerid
    );

    if (!payer) {
      return NextResponse.json(
        { error: "Subscription payer not found" },
        { status: 404 }
      );
    }

    const customerId = payer.stripecustomerid;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}${return_path}`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
