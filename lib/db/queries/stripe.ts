import { db } from "@/lib/db";
import {
  NewStripeCustomer,
  NewStripeInvoice,
  NewStripeSubscription,
  stripecustomers,
  stripeinvoices,
  stripesubscriptions,
  StripeCustomer,
  StripeMetadata,
  StripeSubscription,
} from "@/lib/db/tables/stripe";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { checkUserWorkspaceAccess } from "./workspace";

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
  const currentPeriodStart =
    "current_period_start" in subscription
      ? (subscription.current_period_start as number)
      : null;
  const currentPeriodEnd =
    "current_period_end" in subscription
      ? (subscription.current_period_end as number)
      : null;
  const priceData = subscription.items.data[0]?.price;

  const newSubscription: NewStripeSubscription = {
    stripesubscriptionid: subscription.id,
    stripecustomerid: subscription.customer as string,
    status: subscription.status || null,
    plan: subscription.items.data[0]?.plan?.id || null,
    cancelatperiodend: subscription.cancel_at_period_end || false,
    workspaceid: subscription.metadata?.workspaceid || "",
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

export const getUserWorkspaceStripeSubscription = async (
  userId: string,
  workspaceId: string
): Promise<StripeSubscription | null> => {
  if (!(await checkUserWorkspaceAccess(userId, workspaceId))) {
    return null;
  }

  return getWorkspaceStripeSubscription(workspaceId);
};

export const getWorkspaceStripeSubscription = async (
  workspaceid: string
): Promise<StripeSubscription | null> => {
  const [subscription] = await db
    .select()
    .from(stripesubscriptions)
    .where(
      and(
        eq(stripesubscriptions.workspaceid, workspaceid),
        eq(stripesubscriptions.active, true)
      )
    );
  return subscription || null;
};

export const getWorkspaceStripeCustomer = async (
  stripecustomerid: string
): Promise<StripeCustomer | null> => {
  const [customer] = await db
    .select({
      stripecustomerid: stripecustomers.stripecustomerid,
      name: stripecustomers.name,
      email: stripecustomers.email,
      metadata: stripecustomers.metadata,
      active: stripecustomers.active,
      createdat: stripecustomers.createdat,
      updatedat: stripecustomers.updatedat,
    })
    .from(stripecustomers)
    .where(
      and(
        eq(stripecustomers.stripecustomerid, stripecustomerid),
        eq(stripecustomers.active, true)
      )
    );
  return customer || null;
};
