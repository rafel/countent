import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import {
  upsertStripeCustomer,
  deleteStripeCustomer,
  upsertStripeSubscription,
  deleteStripeSubscription,
  upsertStripeInvoice,
  deleteStripeInvoice,
} from "@/lib/db/queries/stripe";

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

    console.log(`🔔 Webhook received: ${event.type} - ${event.id}`);

    // Handle the event
    switch (event.type) {
      // Customer events
      case "customer.created":
        console.log(`👤 Customer created: ${event.data.object.id}`);
        await upsertStripeCustomer(event.data.object as Stripe.Customer);
        break;

      case "customer.updated":
        console.log(`👤 Customer updated: ${event.data.object.id}`);
        await upsertStripeCustomer(event.data.object as Stripe.Customer);
        break;

      case "customer.deleted":
        console.log(`👤 Customer deleted: ${event.data.object.id}`);
        await deleteStripeCustomer(event.data.object as Stripe.Customer);
        break;

      // Subscription events
      case "customer.subscription.created":
        console.log(`🎉 Subscription created: ${event.data.object.id}`);
        await upsertStripeSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        console.log(`🔄 Subscription updated: ${event.data.object.id}`);
        await upsertStripeSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        console.log(`🗑️ Subscription deleted: ${event.data.object.id}`);
        await deleteStripeSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.trial_will_end":
        console.log(`⏰ Subscription trial will end: ${event.data.object.id}`);
        await upsertStripeSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.paused":
        console.log(`⏸️ Subscription paused: ${event.data.object.id}`);
        await upsertStripeSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.resumed":
        console.log(`▶️ Subscription resumed: ${event.data.object.id}`);
        await upsertStripeSubscription(
          event.data.object as Stripe.Subscription
        );
        break;

      // Invoice events
      case "invoice.created":
        console.log(`📄 Invoice created: ${event.data.object.id}`);
        await upsertStripeInvoice(event.data.object as Stripe.Invoice);
        break;

      case "invoice.updated":
        console.log(`📄 Invoice updated: ${event.data.object.id}`);
        await upsertStripeInvoice(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_succeeded":
        console.log(`💰 Invoice payment succeeded: ${event.data.object.id}`);
        await upsertStripeInvoice(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        console.log(`💸 Invoice payment failed: ${event.data.object.id}`);
        await upsertStripeInvoice(event.data.object as Stripe.Invoice);
        break;
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
