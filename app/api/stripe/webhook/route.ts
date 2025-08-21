import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleCustomerCreated,
  handleCustomerUpdated,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleSubscriptionTrialWillEnd,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
} from "@/lib/stripe/webhook-handlers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      // Subscription events
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.trial_will_end":
        await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.paused":
        await handleSubscriptionPaused(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.resumed":
        await handleSubscriptionResumed(event.data.object as Stripe.Subscription);
        break;

      // Customer events
      case "customer.created":
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      case "customer.updated":
        await handleCustomerUpdated(event.data.object as Stripe.Customer);
        break;

      case "customer.deleted":
        console.log(`🗑️ Customer deleted: ${event.data.object.id}`);
        // TODO: Handle customer deletion - might need to clean up subscription payers
        // For now, just log it since the customer deletion will cascade through foreign keys
        break;

      // Invoice/Payment events
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // Checkout events
      case "checkout.session.completed":
        console.log(`Checkout session completed: ${event.data.object.id}`);
        // The subscription.created event will handle the actual subscription creation
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
