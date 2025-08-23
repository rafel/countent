import { db } from "@/lib/db";
import {
  NewStripeCustomer,
  NewStripeInvoice,
  NewStripeSubscription,
  stripecustomers,
  stripeinvoices,
  StripeSubscriptionWithCustomer,
  stripesubscriptions,
  StripeCustomer,
  StripeMetadata,
} from "@/lib/db/tables/stripe";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import {
  getCurrentSubscription,
  getSubscriptionById,
  updateSubscription,
} from "./subscription";

export const upsertStripeCustomer = async (customer: Stripe.Customer) => {
  const newCustomer: NewStripeCustomer = {
    stripecustomerid: customer.id,
    name: customer.name,
    email: customer.email,
  };
  return db
    .insert(stripecustomers)
    .values(newCustomer)
    .onConflictDoUpdate({
      target: stripecustomers.stripecustomerid,
      set: {
        name: customer.name,
        email: customer.email,
        updatedat: new Date(),
      },
    });
};

export const deleteStripeCustomer = async (customer: Stripe.Customer) => {
  return db
    .update(stripecustomers)
    .set({ active: false })
    .where(eq(stripecustomers.stripecustomerid, customer.id));
};

export const upsertStripeSubscription = async (
  subscription: Stripe.Subscription
) => {
  const stripeCustomerId = subscription.customer as string;
  let stripeCustomer = null;
  try {
    stripeCustomer = await getStripeCustomerByStripeId(stripeCustomerId);
  } catch (error) {
    console.error("Failed to fetch customer from Stripe:", error);
  }

  // If customer doesn't exist in our database, fetch from Stripe and create it
  if (!stripeCustomer) {
    console.log(
      `Customer ${stripeCustomerId} not found in database, fetching from Stripe`
    );
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-07-30.basil",
      });
      const customer = await stripe.customers.retrieve(stripeCustomerId, {
        expand: ["metadata"],
      });
      if (customer && !customer.deleted) {
        await upsertStripeCustomer(customer as Stripe.Customer);
        stripeCustomer = await getStripeCustomerByStripeId(stripeCustomerId);
        console.log("Created customer in database:", stripeCustomer);
      }
    } catch (error) {
      console.error("Failed to fetch customer from Stripe:", error);
    }
  }

  const currentPeriodStart =
    "current_period_start" in subscription
      ? (subscription.current_period_start as number)
      : null;
  const currentPeriodEnd =
    "current_period_end" in subscription
      ? (subscription.current_period_end as number)
      : null;
  // Extract pricing information from the subscription
  const priceData = subscription.items.data[0]?.price;

  // If we still don't have a customer, we cannot proceed due to foreign key constraint
  if (!stripeCustomer) {
    console.error(
      `Cannot process subscription ${subscription.id}: customer ${stripeCustomerId} not found and could not be created`
    );
  }

  // Build subscription object, conditionally including stripecustomerid to avoid FK constraint issues
  const baseSubscription: NewStripeSubscription = {
    stripesubscriptionid: subscription.id,
    stripecustomer: subscription.customer as string,
    status: subscription.status || null,
    plan: subscription.items.data[0]?.plan?.id || null,
    cancelatperiodend: subscription.cancel_at_period_end || false,
    userid:
      (subscription.metadata?.user_id as string) ||
      stripeCustomer?.metadata?.user_id ||
      "",
    companyid:
      (subscription.metadata?.company_id as string) ||
      stripeCustomer?.metadata?.company_id ||
      "",
    subscriptionid:
      (subscription.metadata?.subscriptionid as string) ||
      stripeCustomer?.metadata?.subscriptionid ||
      "",
    currentperiodstart: currentPeriodStart
      ? new Date(currentPeriodStart * 1000)
      : null,
    currentperiodend: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000)
      : null,
    endedat: subscription.ended_at
      ? new Date(subscription.ended_at * 1000)
      : null,
    cancelat: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000)
      : null,
    canceledat: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    trialstart: subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null,
    trialend: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
    // Pricing information
    amount: priceData?.unit_amount?.toString() || null,
    currency: priceData?.currency || null,
    interval: priceData?.recurring?.interval || null,
    intervalcount: priceData?.recurring?.interval_count || null,
    metadata: (subscription.metadata as StripeMetadata) || {},
  };

  // Only add stripecustomerid if we have a valid customer to avoid FK constraint violation
  const newSubscription: NewStripeSubscription =
    stripeCustomer?.stripecustomerid
      ? {
          ...baseSubscription,
          stripecustomerid: stripeCustomer.stripecustomerid,
        }
      : baseSubscription;
  try {
    await db
      .insert(stripesubscriptions)
      .values(newSubscription)
      .onConflictDoUpdate({
        target: stripesubscriptions.stripesubscriptionid,
        set: newSubscription,
      })
      .returning();
  } catch (error) {
    console.error("Failed to insert subscription:", error);
  }

  let userId = subscription.metadata?.user_id as string;
  let companyId = subscription.metadata?.company_id as string;
  let subscriptionId = subscription.metadata?.subscriptionid as string;

  let currentSubscription = null;
  if (subscriptionId && subscriptionId.trim() !== "") {
    currentSubscription = await getSubscriptionById(subscriptionId);
  }
  if (!currentSubscription) {
    console.log("No current subscription found by id", subscriptionId);
    currentSubscription = await getCurrentSubscription(userId, companyId);
  }
  if (!currentSubscription) {
    console.log(
      "No current subscription found by userid and companyid",
      userId,
      companyId
    );
    if (stripeCustomer) {
      const metadata = stripeCustomer.metadata as StripeMetadata;
      console.log("trying customer data", metadata);
      userId = metadata.user_id || "";
      companyId = metadata.company_id || "";
      currentSubscription = await getCurrentSubscription(
        userId,
        companyId,
        true
      );
    }
  }
  if (currentSubscription) {
    try {
      const updateData = {
        ...currentSubscription,
        stripesubscriptionid: subscription.id,
      };
      await updateSubscription(updateData);
    } catch (error) {
      console.error("Failed to update subscription1:", error);
    }
  } else {
    console.log(
      "Updated stripesubscription but no current subscription found",
      subscription.id
    );
  }

  return subscription;
};

export const deleteStripeSubscription = async (
  subscription: Stripe.Subscription
) => {
  return db
    .update(stripesubscriptions)
    .set({ active: false })
    .where(eq(stripesubscriptions.stripesubscriptionid, subscription.id));
};

export const upsertStripeInvoice = async (invoice: Stripe.Invoice) => {
  const newInvoice: NewStripeInvoice = {
    stripeinvoiceid: invoice.id || "",
    stripecustomerid: invoice.customer as string,
    amountdue: invoice.amount_due.toString(),
    amountpaid: invoice.amount_paid.toString(),
    amountremaining: invoice.amount_remaining.toString(),
    billingreason: invoice.billing_reason,
    currency: invoice.currency,
    hostedinvoiceurl: invoice.hosted_invoice_url,
    status: invoice.status,
  };
  return db
    .insert(stripeinvoices)
    .values(newInvoice)
    .onConflictDoUpdate({
      target: stripeinvoices.stripeinvoiceid,
      set: {
        ...newInvoice,
        updatedat: new Date(),
      },
    });
};

export const deleteStripeInvoice = async (invoice: Stripe.Invoice) => {
  return db
    .update(stripeinvoices)
    .set({ active: false })
    .where(
      and(
        eq(stripeinvoices.stripeinvoiceid, invoice.id || ""),
        eq(stripeinvoices.stripecustomerid, invoice.customer as string)
      )
    );
};

export const getStripeSubscriptionByStripeId = async (
  stripeSubscriptionId: string
): Promise<StripeSubscriptionWithCustomer | null> => {
  const result = await db
    .select()
    .from(stripesubscriptions)
    .innerJoin(
      stripecustomers,
      eq(stripesubscriptions.stripecustomerid, stripecustomers.stripecustomerid)
    )
    .where(
      and(
        eq(stripesubscriptions.stripesubscriptionid, stripeSubscriptionId),
        eq(stripesubscriptions.active, true),
        eq(stripecustomers.active, true)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  // Transform the joined result into our typed structure
  return {
    subscription: result[0].stripesubscriptions,
    customer: result[0].stripecustomers,
  };
};

export const getStripeCustomerByStripeId = async (
  stripeCustomerId: string
): Promise<StripeCustomer | null> => {
  const [result] = await db
    .select()
    .from(stripecustomers)
    .where(eq(stripecustomers.stripecustomerid, stripeCustomerId))
    .limit(1);

  return result;
};
