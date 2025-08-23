import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/user";
import { ChatSDKError } from "@/lib/errors";

import { commonSettings } from "@/content/common";
import { getCurrentSubscription } from "@/lib/db/queries/subscription";
import {
  getStripeSubscriptionByStripeId,
  upsertStripeCustomer,
} from "@/lib/db/queries/stripe";
import { NewStripeMetadata } from "@/lib/db/tables/stripe";

export interface CheckoutSessionRequest {
  lookup_key: string;
  success_path: string;
  cancel_path: string;
  company_id?: string;
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
    const { lookup_key, success_path, cancel_path, company_id } = body;

    if (!lookup_key) {
      console.error("No lookup key found");
      return new ChatSDKError(
        "bad_request:stripe",
        "No lookup key provided"
      ).toResponse();
    }

    const subscription = await getCurrentSubscription(
      session.user.id,
      company_id!
    );

    if (!subscription) {
      return new ChatSDKError(
        "bad_request:stripe",
        "No subscription found"
      ).toResponse();
    }
    let stripecustomerid;
    let email = session.user.email;

    if (subscription.stripesubscriptionid) {
      const stripeSubscription = await getStripeSubscriptionByStripeId(
        subscription.stripesubscriptionid
      );
      stripecustomerid = stripeSubscription?.customer.stripecustomerid;
      if (stripeSubscription?.customer.email) {
        email = stripeSubscription?.customer.email;
      }
    }

    const stripeMetadata: NewStripeMetadata = {
      user_id: session.user.id,
      model: commonSettings.subscriptionModel,
      company_id: company_id || "",
      subscriptionid: subscription.subscriptionid,
    };

    if (!stripecustomerid) {
      try {
        const customers = await stripe.customers.list({
          email,
          limit: 1,
        });
        let customer = customers.data.length > 0 ? customers.data[0] : null;
        if (!customer) {
          customer = await stripe.customers.create({
            email: email,
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
      lookup_keys: [lookup_key],
      expand: ["data.product"],
    });

    if (prices.data.length === 0) {
      console.error("No price found for lookup key:", lookup_key);
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
      success_url: `${baseUrl}${success_path}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancel_path}`,
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
