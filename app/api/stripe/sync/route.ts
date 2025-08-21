import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/user";
import { ChatSDKError } from "@/lib/errors";
import { stripe } from "@/lib/stripe/stripe";
import { getSubscriptionPeriod } from "@/lib/stripe/stripe-extended-types";
import { 
  getUserAllSubscriptions, 
  getCompanySubscriptions,
  updateSubscriptionByStripeId 
} from "@/lib/db/queries/subscription";
import { db } from "@/lib/db";
import { subscriptioninfo } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { commonSettings } from "@/content/common";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new ChatSDKError("unauthorized:api").toResponse();
    }

    const body = await request.json();
    const { company_id } = body;

    console.log(`🔄 Manual sync requested by user: ${session.user.id}`);

    // Get user's subscriptions
    let subscriptions;
    if (commonSettings.subscriptionModel === "b2b" && company_id) {
      subscriptions = await getCompanySubscriptions(company_id);
    } else {
      subscriptions = await getUserAllSubscriptions(session.user.id);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found to sync" },
        { status: 404 }
      );
    }

    const syncResults = [];

    for (const subscription of subscriptions) {
      if (!subscription.stripesubscriptionid) {
        console.log(`⏭️ Skipping subscription ${subscription.subscriptionid} - no Stripe ID`);
        continue;
      }

      try {
        // Fetch latest data from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripesubscriptionid
        );

        console.log(`📡 Syncing subscription: ${stripeSubscription.id}`);
        const period = getSubscriptionPeriod(stripeSubscription);
        console.log(`📋 Stripe data:`, {
          status: stripeSubscription.status,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          canceled_at: stripeSubscription.canceled_at,
          current_period_end: period.current_period_end,
        });

        // Update subscription status
        await updateSubscriptionByStripeId(stripeSubscription.id, {
          status: stripeSubscription.status,
          currentperiodend: period.current_period_end
            ? new Date(period.current_period_end * 1000)
            : null,
        });

        // Update subscription info
        const priceData = stripeSubscription.items.data[0]?.price;
        await db
          .update(subscriptioninfo)
          .set({
            currentperiodstart: period.current_period_start 
              ? new Date(period.current_period_start * 1000) 
              : null,
            cancelatperiodend: stripeSubscription.cancel_at_period_end || false,
            canceledat: stripeSubscription.canceled_at 
              ? new Date(stripeSubscription.canceled_at * 1000) 
              : null,
            amount: priceData?.unit_amount || null,
            currency: priceData?.currency || 'usd',
            interval: priceData?.recurring?.interval || null,
            intervalcount: priceData?.recurring?.interval_count || 1,
            syncstrategy: 'manual_sync',
            laststripesyncAt: new Date(),
            metadata: stripeSubscription.metadata || {},
            updatedat: new Date(),
          })
          .where(eq(subscriptioninfo.subscriptionid, subscription.subscriptionid));

        syncResults.push({
          subscriptionId: subscription.subscriptionid,
          stripeId: stripeSubscription.id,
          status: stripeSubscription.status,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          synced: true,
        });

        console.log(`✅ Synced subscription: ${stripeSubscription.id}`);

      } catch (error) {
        console.error(`❌ Error syncing subscription ${subscription.stripesubscriptionid}:`, error);
        syncResults.push({
          subscriptionId: subscription.subscriptionid,
          stripeId: subscription.stripesubscriptionid,
          error: error instanceof Error ? error.message : "Unknown error",
          synced: false,
        });
      }
    }

    console.log(`🎉 Sync complete. Results:`, syncResults);

    return NextResponse.json({
      success: true,
      syncedCount: syncResults.filter(r => r.synced).length,
      totalCount: syncResults.length,
      results: syncResults,
    });

  } catch (error) {
    console.error("Stripe sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscriptions" },
      { status: 500 }
    );
  }
}
