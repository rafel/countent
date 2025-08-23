import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/user";
import { ChatSDKError } from "@/lib/errors";
import { getWorkspaceStripeSubscription } from "@/lib/db/queries/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export interface PortalSessionRequest {
  path: string;
  workspaceid: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:api").toResponse();
    }

    const body: PortalSessionRequest = await request.json();
    const { path, workspaceid } = body;

    if (!workspaceid) {
      console.error("No workspace id found");
      return new ChatSDKError(
        "bad_request:stripe",
        "No workspace id provided"
      ).toResponse();
    }
    if (!path) {
      console.error("No path found");
      return new ChatSDKError(
        "bad_request:stripe",
        "No path provided"
      ).toResponse();
    }

    const subscription = await getWorkspaceStripeSubscription(workspaceid);

    if (!subscription?.stripecustomerid) {
      return new ChatSDKError("not_found:subscription").toResponse();
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripecustomerid,
      return_url: `${baseUrl}${path}`,
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
