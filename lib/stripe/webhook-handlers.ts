import "server-only";
import Stripe from "stripe";
import {
  getSubscriptionPeriod,
  getInvoiceSubscription,
} from "./stripe-extended-types";
import {
  getSubscriptionByStripeId,
  updateSubscriptionByStripeId,
  createSubscription,
  getSubscriptionPayerByStripeId,
  createSubscriptionPayer,
  updateSubscriptionPayer,
} from "@/lib/db/queries/subscription";
import { db } from "@/lib/db";
import { subscriptioninfo, subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getPlanFromLookupKey } from "@/lib/subscription/subscription-access";
import type { StripePriceLookupKey, SubscriptionPlans } from "@/content/common";

/**
 * Handle subscription created event
 * This happens when a customer successfully subscribes via Stripe Checkout
 */
export async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
) {
  console.log(`🎉 Subscription created: ${subscription.id}`);

  try {
    // Get the price lookup key to determine the plan
    const priceId = subscription.items.data[0]?.price
      .lookup_key as StripePriceLookupKey;
    if (!priceId) {
      console.error("No price lookup key found in subscription");
      return;
    }

    const plan = getPlanFromLookupKey(priceId);
    if (!plan) {
      console.error(`Unknown plan for lookup key: ${priceId}`);
      return;
    }

    // Get or create subscription payer
    const customerId = subscription.customer as string;
    let payer = await getSubscriptionPayerByStripeId(customerId);

    if (!payer) {
      // This shouldn't happen if checkout was properly set up, but handle it
      console.warn(`No payer found for customer ${customerId}, creating one`);

      // Get customer details from Stripe
      const customer = (await stripe.customers.retrieve(
        customerId
      )) as Stripe.Customer;

      payer = await createSubscriptionPayer({
        payertype:
          subscription.metadata.payer_type === "company" ? "company" : "user",
        userid:
          subscription.metadata.payer_type === "user"
            ? subscription.metadata.user_id || null
            : null,
        companyid:
          subscription.metadata.payer_type === "company"
            ? subscription.metadata.company_id || null
            : null,
        stripecustomerid: customerId,
        billingemail: customer.email || "",
        billingname: customer.name || "",
        vatnumber: null, // VAT number would need to be handled separately via tax_ids API
      });
    }

    // Create subscription in our database
    const period = getSubscriptionPeriod(subscription);
    await createSubscription({
      subscriptionpayerid: payer.subscriptionpayerid,
      plan: plan as SubscriptionPlans,
      status: subscription.status,
      stripesubscriptionid: subscription.id,
      currentperiodend: period.current_period_end
        ? new Date(period.current_period_end * 1000)
        : null,
    });

    console.log(`✅ Subscription ${subscription.id} created in database`);
  } catch (error) {
    console.error(`❌ Error handling subscription created:`, error);
    throw error;
  }
}

/**
 * Handle subscription updated event
 * This happens when subscription status changes, plan changes, cancellations, etc.
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  console.log(`🔄 Subscription updated: ${subscription.id}`);
  const period = getSubscriptionPeriod(subscription);
  console.log(`📋 Update details:`, {
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at,
    current_period_end: period.current_period_end,
  });

  try {
    // Get the price lookup key to determine the plan
    const priceId = subscription.items.data[0]?.price
      .lookup_key as StripePriceLookupKey;
    let plan: SubscriptionPlans | null = null;

    if (priceId) {
      plan = getPlanFromLookupKey(priceId) as SubscriptionPlans;
    }

    // Update subscription in our database
    const updateData: Partial<typeof subscriptions.$inferInsert> = {
      status: subscription.status,
      currentperiodend: period.current_period_end
        ? new Date(period.current_period_end * 1000)
        : null,
    };

    if (plan) {
      updateData.plan = plan;
    }

    const updatedSub = await updateSubscriptionByStripeId(
      subscription.id,
      updateData
    );

    if (!updatedSub) {
      console.error(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription info with latest Stripe data
    const priceData = subscription.items.data[0]?.price;
    await db
      .update(subscriptioninfo)
      .set({
        currentperiodstart: period.current_period_start
          ? new Date(period.current_period_start * 1000)
          : null,
        cancelatperiodend: subscription.cancel_at_period_end || false,
        canceledat: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
        amount: priceData?.unit_amount || null,
        currency: priceData?.currency || "usd",
        interval: priceData?.recurring?.interval || null,
        intervalcount: priceData?.recurring?.interval_count || 1,
        syncstrategy: "webhook",
        laststripesyncAt: new Date(),
        metadata: subscription.metadata || {},
        updatedat: new Date(),
      })
      .where(eq(subscriptioninfo.subscriptionid, updatedSub.subscriptionid));

    // Log specific actions
    if (subscription.cancel_at_period_end) {
      console.log(
        `⏰ Subscription ${subscription.id} will cancel at period end`
      );
    }

    if (subscription.canceled_at) {
      console.log(
        `❌ Subscription ${subscription.id} was canceled immediately`
      );
    }

    if (plan) {
      console.log(
        `📦 Subscription ${subscription.id} plan changed to: ${plan}`
      );
    }

    console.log(`✅ Subscription ${subscription.id} updated in database`);
  } catch (error) {
    console.error(`❌ Error handling subscription updated:`, error);
    throw error;
  }
}

/**
 * Handle subscription deleted/canceled event
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  console.log(`🗑️ Subscription deleted: ${subscription.id}`);

  try {
    // Update subscription status to canceled
    const updatedSub = await updateSubscriptionByStripeId(subscription.id, {
      status: "canceled",
      currentperiodend: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    });

    if (!updatedSub) {
      console.error(`Subscription ${subscription.id} not found in database`);
      return;
    }

    console.log(
      `✅ Subscription ${subscription.id} marked as canceled in database`
    );
  } catch (error) {
    console.error(`❌ Error handling subscription deleted:`, error);
    throw error;
  }
}

/**
 * Handle customer created event
 * This happens when a new customer is created in Stripe
 */
export async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log(`👤 Customer created: ${customer.id}`);

  try {
    // Check if we already have a payer for this customer
    const existingPayer = await getSubscriptionPayerByStripeId(customer.id);

    if (existingPayer) {
      console.log(`Payer already exists for customer ${customer.id}`);
      return;
    }

    // Create subscription payer
    await createSubscriptionPayer({
      payertype:
        customer.metadata.payer_type === "company" ? "company" : "user",
      userid: customer.metadata.user_id || null,
      companyid: customer.metadata.company_id || null,
      stripecustomerid: customer.id,
      billingemail: customer.email || "",
      billingname: customer.name || "",
      vatnumber: null, // VAT number would need to be handled separately via tax_ids API
    });

    console.log(`✅ Payer created for customer ${customer.id}`);
  } catch (error) {
    console.error(`❌ Error handling customer created:`, error);
    throw error;
  }
}

/**
 * Handle customer updated event
 */
export async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log(`👤 Customer updated: ${customer.id}`);

  try {
    const payer = await getSubscriptionPayerByStripeId(customer.id);

    if (!payer) {
      console.warn(`No payer found for customer ${customer.id}`);
      return;
    }

    // Update payer information
    await updateSubscriptionPayer(payer.subscriptionpayerid, {
      billingemail: customer.email || payer.billingemail,
      billingname: customer.name || payer.billingname,
      vatnumber: null,
    });

    console.log(`✅ Payer updated for customer ${customer.id}`);
  } catch (error) {
    console.error(`❌ Error handling customer updated:`, error);
    throw error;
  }
}

/**
 * Handle invoice payment succeeded event
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice payment succeeded: ${invoice.id}`);

  try {
    const subscriptionId = getInvoiceSubscription(invoice);

    if (!subscriptionId) {
      console.log("Invoice not related to subscription, skipping");
      return;
    }

    // Update subscription status to active if it was past_due
    const subscription = await getSubscriptionByStripeId(subscriptionId);
    if (subscription && subscription.status !== "active") {
      await updateSubscriptionByStripeId(subscriptionId, {
        status: "active",
      });
      console.log(`✅ Subscription ${subscriptionId} reactivated`);
    }

    // Here you could also create payment records if needed
    // await createPaymentRecord({...});
  } catch (error) {
    console.error(`❌ Error handling invoice payment succeeded:`, error);
    throw error;
  }
}

/**
 * Handle invoice payment failed event
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`💸 Invoice payment failed: ${invoice.id}`);

  try {
    const subscriptionId = getInvoiceSubscription(invoice);

    if (!subscriptionId) {
      console.log("Invoice not related to subscription, skipping");
      return;
    }

    // Update subscription status based on attempt count
    if (invoice.attempt_count >= 3) {
      await updateSubscriptionByStripeId(subscriptionId, {
        status: "past_due",
      });
      console.log(`⚠️ Subscription ${subscriptionId} marked as past_due`);
    }

    // Here you could send notification emails, create payment failure records, etc.
  } catch (error) {
    console.error(`❌ Error handling invoice payment failed:`, error);
    throw error;
  }
}

/**
 * Handle customer subscription trial will end event
 */
export async function handleSubscriptionTrialWillEnd(
  subscription: Stripe.Subscription
) {
  console.log(`⏰ Subscription trial will end: ${subscription.id}`);

  try {
    // Here you could send notification emails to users about trial ending
    // Get the subscription from database to find associated users/companies
    const dbSubscription = await getSubscriptionByStripeId(subscription.id);

    if (dbSubscription) {
      // Send notifications based on your business logic
      console.log(`Trial ending for subscription ${subscription.id}`);
      // await sendTrialEndingNotification(dbSubscription);
    }
  } catch (error) {
    console.error(`❌ Error handling subscription trial will end:`, error);
    throw error;
  }
}

/**
 * Handle subscription paused event
 * This occurs when a subscription enters status=paused
 */
export async function handleSubscriptionPaused(
  subscription: Stripe.Subscription
) {
  console.log(`⏸️ Subscription paused: ${subscription.id}`);
  const period = getSubscriptionPeriod(subscription);
  console.log(`📋 Pause details:`, {
    status: subscription.status,
    pause_collection: subscription.pause_collection,
    current_period_end: period.current_period_end,
  });

  try {
    // Update subscription status in database
    const updatedSub = await updateSubscriptionByStripeId(subscription.id, {
      status: subscription.status, // Should be "paused"
      currentperiodend: period.current_period_end
        ? new Date(period.current_period_end * 1000)
        : null,
    });

    if (!updatedSub) {
      console.error(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription info
    await db
      .update(subscriptioninfo)
      .set({
        syncstrategy: "webhook",
        laststripesyncAt: new Date(),
        metadata: subscription.metadata || {},
        updatedat: new Date(),
      })
      .where(eq(subscriptioninfo.subscriptionid, updatedSub.subscriptionid));

    console.log(
      `✅ Subscription ${subscription.id} marked as paused in database`
    );

    // TODO: Send notification to user about paused subscription
    // TODO: Update user access if needed (depending on your business logic)
  } catch (error) {
    console.error(`❌ Error handling subscription paused:`, error);
    throw error;
  }
}

/**
 * Handle subscription resumed event
 * This occurs when a paused subscription is resumed
 */
export async function handleSubscriptionResumed(
  subscription: Stripe.Subscription
) {
  console.log(`▶️ Subscription resumed: ${subscription.id}`);
  const period = getSubscriptionPeriod(subscription);
  console.log(`📋 Resume details:`, {
    status: subscription.status,
    current_period_end: period.current_period_end,
  });

  try {
    // Update subscription status in database
    const updatedSub = await updateSubscriptionByStripeId(subscription.id, {
      status: subscription.status, // Should be "active"
      currentperiodend: period.current_period_end
        ? new Date(period.current_period_end * 1000)
        : null,
    });

    if (!updatedSub) {
      console.error(`Subscription ${subscription.id} not found in database`);
      return;
    }

    // Update subscription info
    const priceData = subscription.items.data[0]?.price;
    await db
      .update(subscriptioninfo)
      .set({
        currentperiodstart: period.current_period_start
          ? new Date(period.current_period_start * 1000)
          : null,
        amount: priceData?.unit_amount || null,
        currency: priceData?.currency || "usd",
        interval: priceData?.recurring?.interval || null,
        intervalcount: priceData?.recurring?.interval_count || 1,
        syncstrategy: "webhook",
        laststripesyncAt: new Date(),
        metadata: subscription.metadata || {},
        updatedat: new Date(),
      })
      .where(eq(subscriptioninfo.subscriptionid, updatedSub.subscriptionid));

    console.log(
      `✅ Subscription ${subscription.id} marked as resumed in database`
    );

    // TODO: Send notification to user about resumed subscription
    // TODO: Restore user access
  } catch (error) {
    console.error(`❌ Error handling subscription resumed:`, error);
    throw error;
  }
}

// Import stripe instance (you'll need to adjust this import)
import { stripe } from "./stripe";
