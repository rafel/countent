import { NextRequest, NextResponse } from "next/server";
import { getUserWithSession } from "@/lib/user";
import { checkSubscriptionAccess } from "@/lib/db/queries/subscription";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId } = body;

    const subscriptionAccess = await checkSubscriptionAccess(
      user.user.userid,
      companyId || undefined
    );

    return NextResponse.json(subscriptionAccess);
  } catch (error) {
    console.error("Error fetching subscription access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
