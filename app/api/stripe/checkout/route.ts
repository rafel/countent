import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/user";
import { ChatSDKError } from "@/lib/errors";

import { StripeMetadata } from "@/lib/db/tables/stripe";
import { getWorkspaceStripeSubscription } from "@/lib/db/queries/stripe";

export interface CheckoutSessionRequest {
  lookupkey: string;
  path: string;
  workspaceid: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:api").toResponse();
    }

    const body: CheckoutSessionRequest = await request.json();
    const { lookupkey, path, workspaceid } = body;

    if (!lookupkey) {
      console.error("No lookup key found");
      return new ChatSDKError(
        "bad_request:stripe",
        "No lookup key provided"
      ).toResponse();
    }
    if (!workspaceid) {
      console.error("No workspace id found");
      return new ChatSDKError(
        "bad_request:stripe",
        "No workspace id provided"
      ).toResponse();
    }
    if (!path) {
      console.error("No path found");
      return new ChatSDKError(
        "bad_request:stripe",
        "No path provided"
      ).toResponse();
    }

    const stripeMetadata: StripeMetadata = {
      workspaceid: workspaceid,
    };

    const subscription = await getWorkspaceStripeSubscription(workspaceid);

    let stripecustomerid = subscription?.stripecustomerid;

    if (!stripecustomerid) {
      try {
        const customers = await stripe.customers.list({
          email: session.user.email,
          limit: 1,
        });
        let customer = customers.data.length > 0 ? customers.data[0] : null;
        if (!customer) {
          customer = await stripe.customers.create({
            email: session.user.email,
            name: session.user.name || undefined,
            metadata: stripeMetadata,
          });
        }
        if (!customer) {
          return new ChatSDKError("not_found:payer").toResponse();
        }
        stripecustomerid = customer.id;
      } catch (error) {
        console.error("Error creating/getting customer:", error);
        return new ChatSDKError(
          "bad_request:stripe",
          "No customer found"
        ).toResponse();
      }
    }

    // Get the price using the lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookupkey],
      expand: ["data.product"],
    });

    if (prices.data.length === 0) {
      console.error("No price found for lookup key:", lookupkey);
      return new ChatSDKError(
        "bad_request:stripe",
        "No price found"
      ).toResponse();
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      customer: stripecustomerid,
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}${path}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${path}?cancel=true`,
      metadata: stripeMetadata,
      subscription_data: {
        metadata: stripeMetadata,
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      session_id: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
