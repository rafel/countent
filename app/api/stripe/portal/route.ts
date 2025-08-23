import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/user";
import { ChatSDKError } from "@/lib/errors";
import {
  getSubscriptionPayerById,
  getCurrentSubscription,
} from "@/lib/db/queries/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export interface PortalSessionRequest {
  return_path: string;
  company_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:api").toResponse();
    }

    const body: PortalSessionRequest = await request.json();
    const { return_path, company_id } = body;

    const subscription = await getCurrentSubscription(
      session.user.id,
      company_id!
    );

    if (!subscription) {
      throw new ChatSDKError("not_found:subscription").toResponse();
    }

    const payer = await getSubscriptionPayerById(
      subscription.subscriptionpayerid
    );

    if (!payer || !payer.stripecustomerid) {
      throw new ChatSDKError("not_found:payer").toResponse();
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: payer.stripecustomerid,
      return_url: `${baseUrl}${return_path}`,
    });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
