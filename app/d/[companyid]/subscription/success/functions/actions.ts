"use server";

import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";
import { getSubscriptionPeriod } from "@/lib/stripe/stripe-extended-types";
import {
  createSubscriptionPayer,
  createSubscription,
  getSubscriptionByStripeId,
  addUserToSubscription,
  addCompanyToSubscription,
} from "@/lib/db/queries/subscription";
import { db } from "@/lib/db";
import { subscriptioninfo } from "@/lib/db/schema";
import { commonSettings, type SubscriptionPlans, type StripePriceLookupKey } from "@/content/common";
import { getPlanFromLookupKey } from "@/lib/subscription/subscription-access";

export async function handleCheckoutSuccess(
  sessionId: string,
  userId: string,
  companyId: string
) {
  try {
    console.log(`🎉 Processing checkout success for session: ${sessionId}`);

    // 1. Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (!session.subscription) {
      return { success: false, error: "No subscription found in session" };
    }

    const subscription = session.subscription as Stripe.Subscription;
    const customer = session.customer as Stripe.Customer;

    console.log(`📋 Session details:`, {
      sessionId,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
    });

    // 2. Check if subscription already exists in our database
    const existingSubscription = await getSubscriptionByStripeId(
      subscription.id
    );
    if (existingSubscription) {
      console.log(`✅ Subscription already exists in database`);
      return { success: true, message: "Subscription already processed" };
    }

    // 3. Get the price lookup key to determine the plan
    const priceId = subscription.items.data[0]?.price.lookup_key;
    if (!priceId) {
      return { success: false, error: "No price lookup key found" };
    }

    const plan = getPlanFromLookupKey(priceId as StripePriceLookupKey);
    if (!plan) {
      return {
        success: false,
        error: `Unknown plan for lookup key: ${priceId}`,
      };
    }

    console.log(`📦 Plan determined: ${plan} from lookup key: ${priceId}`);

    // 4. Create subscription payer
    const payerType =
      commonSettings.subscriptionModel === "b2b" ? "company" : "user";

    const payer = await createSubscriptionPayer({
      payertype: payerType,
      userid: payerType === "user" ? userId : null,
      companyid: payerType === "company" ? companyId : null,
      stripecustomerid: customer.id,
      billingemail: customer.email || "",
      billingname: customer.name || "",
      vatnumber: null,
    });

    console.log(
      `👤 Created payer: ${payer.subscriptionpayerid} (type: ${payerType})`
    );

    // 5. Create subscription in our database
    const period = getSubscriptionPeriod(subscription);
    const dbSubscription = await createSubscription({
      subscriptionpayerid: payer.subscriptionpayerid,
      plan: plan as SubscriptionPlans,
      status: subscription.status,
      stripesubscriptionid: subscription.id,
      currentperiodend: period.current_period_end
        ? new Date(period.current_period_end * 1000)
        : null,
    });

    console.log(`📝 Created subscription: ${dbSubscription.subscriptionid}`);

    // 6. Create subscription info with detailed Stripe data
    const priceData = subscription.items.data[0]?.price;
      await db.insert(subscriptioninfo).values({
        subscriptionid: dbSubscription.subscriptionid,
        stripepriceid: priceData?.id || null,
        stripeproductid: typeof priceData?.product === 'string' ? priceData.product : priceData?.product?.id || null,
        currentperiodstart: period.current_period_start 
          ? new Date(period.current_period_start * 1000) 
          : null,
        cancelatperiodend: subscription.cancel_at_period_end || false,
        canceledat: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000) 
          : null,
        trialstart: subscription.trial_start 
          ? new Date(subscription.trial_start * 1000) 
          : null,
        trialend: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000) 
          : null,
        amount: priceData?.unit_amount || null,
        currency: priceData?.currency || 'usd',
        interval: priceData?.recurring?.interval || null,
        intervalcount: priceData?.recurring?.interval_count || 1,
        syncstrategy: 'success_page',
        laststripesyncAt: new Date(),
        metadata: subscription.metadata || {},
      });

    console.log(`📊 Created subscription info with Stripe details`);

    // 7. Grant access based on subscription model
    if (payerType === "company") {
      // B2B: Grant access to the company
      await addCompanyToSubscription(dbSubscription.subscriptionid, companyId);
      console.log(`🏢 Granted company access: ${companyId}`);
    } else {
      // B2C: Grant access to the user
      await addUserToSubscription(dbSubscription.subscriptionid, userId);
      console.log(`👤 Granted user access: ${userId}`);
    }

    console.log(`✅ Subscription setup complete!`);

    return {
      success: true,
      subscriptionId: dbSubscription.subscriptionid,
      plan: plan,
    };
  } catch (error) {
    console.error(`❌ Error processing checkout success:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
