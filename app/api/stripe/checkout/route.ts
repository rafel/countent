import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/user";
import { ChatSDKError } from "@/lib/errors";

import { commonSettings } from "@/content/common";
import {
  getCurrentSubscription,
  getSubscriptionPayerById,
  updateSubscriptionPayer,
} from "@/lib/db/queries/subscription";

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
    const { lookup_key, success_path, cancel_path, company_id } =
      body;

    const subscription = await getCurrentSubscription(
      session.user.id,
      company_id!
    );

    if (!subscription) {
      return new ChatSDKError("not_found:subscription").toResponse();
    }

    const payer = await getSubscriptionPayerById(
      subscription.subscriptionpayerid
    );

    if (!payer) {
      return new ChatSDKError("not_found:payer").toResponse();
    }
    const email = payer.billingemail || session.user.email;

    if (!email) {
      console.error("No billing email or user email found");
      return new ChatSDKError("bad_request:stripe").toResponse();
    }

    if (!lookup_key) {
      console.error("No lookup key found");
      return new ChatSDKError("bad_request:stripe").toResponse();
    }

    // Get the price using the lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ["data.product"],
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create or get customer
    let customerId = payer.stripecustomerid;
    if (!customerId) {
      try {
        const customers = await stripe.customers.list({
          email,
          limit: 1,
        });
        let customer;
        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: email,
            name: session.user.name || undefined,
            metadata: {
              user_id: session.user.id,
              payer_type:
                commonSettings.subscriptionModel === "b2b" ? "company" : "user",
              company_id: company_id || "",
            },
          });
        }
        if (!customer) {
          return new ChatSDKError("not_found:payer").toResponse();
        }
        customerId = customer.id;
      } catch (error) {
        console.error("Error creating/getting customer:", error);
        return NextResponse.json(
          { error: "Failed to create customer" },
          { status: 500 }
        );
      }
    }

    if (customerId && !payer.stripecustomerid) {
      await updateSubscriptionPayer(payer.subscriptionpayerid, {
        stripecustomerid: customerId,
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      customer: customerId,
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}${success_path}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${cancel_path}`,
      metadata: {
        user_id: session.user.id,
        payer_type: payer.payertype,
        company_id: company_id || "",
      },
      subscription_data: {
        metadata: {
          user_id: session.user.id,
          payer_type: payer.payertype,
          company_id: company_id || "",
        },
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
