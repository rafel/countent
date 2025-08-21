import { NextRequest, NextResponse } from "next/server";
import { getUserWithSession } from "@/utils/user";
import { checkSubscriptionAccess } from "@/lib/subscription/subscription-access";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserWithSession();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

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
