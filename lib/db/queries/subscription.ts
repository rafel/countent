import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  subscriptions,
  subscriptioncompanies,
  subscriptionusers,
  type Subscription,
  type NewSubscription,
  type SubscriptionCompany,
  type SubscriptionUser,
  User,
  Company,
} from "@/lib/db/schema";
import { commonSettings, SubscriptionPlans } from "@/content/common";
import { SubscriptionAccess } from "../tables/subscription";
import { getStripeSubscriptionByStripeId } from "./stripe";

// Create a B2C personal subscription
export async function createPersonalSubscription(
  user: User,
  plan: SubscriptionPlans = commonSettings.defaultSubscriptionPlan
) {
  const newSubscription: NewSubscription = {
    plan,
    status: "active",
    model: commonSettings.subscriptionModel,
  };

  const [subscription] = await db
    .insert(subscriptions)
    .values(newSubscription)
    .returning();

  // 3. Grant access to the user
  await addUserToSubscription(subscription.subscriptionid, user.userid);

  return { subscription };
}

// Create a B2B subscription (company pays, all members get access)
export async function createTeamSubscription(
  company: Company,
  user: User,
  plan: SubscriptionPlans = commonSettings.defaultSubscriptionPlan
) {
  const newSubscription: NewSubscription = {
    plan,
    status: "active",
    model: commonSettings.subscriptionModel,
  };

  const [subscription] = await db
    .insert(subscriptions)
    .values(newSubscription)
    .returning();

  await addCompanyToSubscription(
    subscription.subscriptionid,
    company.companyid
  );

  return { subscription };
}

/**
 * Check if user has subscription access for a specific context
 * This is the main function to use throughout the app
 */
export async function checkSubscriptionAccess(
  userId: string,
  companyId?: string
): Promise<SubscriptionAccess> {
  try {
    const currentSubscription = await getCurrentSubscription(
      userId,
      companyId!
    );
    if (!currentSubscription || !currentSubscription.stripesubscriptionid) {
      return {
        hasAccess: false,
        plan: "free",
        hasBillingPage: false,
      };
    }

    const stripeSubscription = await getStripeSubscriptionByStripeId(
      currentSubscription.stripesubscriptionid
    );

    return {
      hasAccess: true,
      plan: currentSubscription.plan,
      hasBillingPage: stripeSubscription?.customer.stripecustomerid
        ? true
        : false,
    };
  } catch (error) {
    console.error("Error checking subscription access:", error);
    return {
      hasAccess: false,
      plan: "free",
      hasBillingPage: false,
    };
  }
}

export async function getCurrentSubscription(
  userId: string,
  companyId: string,
  suppressError: boolean = false
): Promise<Subscription | null> {
  if (commonSettings.subscriptionModel === "b2b") {
    if (!companyId) {
      if (!suppressError) {
        throw new Error("Company ID is required for B2B subscriptions");
      }
      return null;
    }
    return await getCompanySubscription(companyId);
  } else {
    return await getUserSubscription(userId);
  }
}

export async function getSubscriptionById(
  subscriptionId: string
): Promise<Subscription | null> {
  const [results] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subscriptionid, subscriptionId));

  return results;
}

// Get all subscriptions for a user (as payer) - includes inactive
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  const [results] = await db
    .select()
    .from(subscriptions)
    .innerJoin(
      subscriptionusers,
      eq(subscriptions.subscriptionid, subscriptionusers.subscriptionid)
    )
    .where(and(eq(subscriptionusers.userid, userId)))
    .orderBy(desc(subscriptions.createdat));

  return results ? results.subscriptions : null;
}

// Get all subscriptions that cover a specific company - includes inactive
export async function getCompanySubscription(
  companyId: string
): Promise<Subscription | null> {
  const [results] = await db
    .select()
    .from(subscriptions)
    .innerJoin(
      subscriptioncompanies,
      eq(subscriptions.subscriptionid, subscriptioncompanies.subscriptionid)
    )
    .where(eq(subscriptioncompanies.companyid, companyId))
    .orderBy(desc(subscriptions.createdat));

  return results ? results.subscriptions : null;
}

export async function addCompanyToSubscription(
  subscriptionId: string,
  companyId: string
): Promise<SubscriptionCompany> {
  const [subscriptionCompany] = await db
    .insert(subscriptioncompanies)
    .values({
      subscriptionid: subscriptionId,
      companyid: companyId,
    })
    .returning();

  return subscriptionCompany;
}

export async function addUserToSubscription(
  subscriptionId: string,
  userId: string
): Promise<SubscriptionUser> {
  const [subscriptionUser] = await db
    .insert(subscriptionusers)
    .values({
      subscriptionid: subscriptionId,
      userid: userId,
    })
    .returning();

  return subscriptionUser;
}

export async function updateSubscription(
  newSubscription: NewSubscription
): Promise<Subscription | null> {
  const [subscription] = await db
    .insert(subscriptions)
    .values(newSubscription)
    .onConflictDoUpdate({
      target: subscriptions.subscriptionid,
      set: {
        ...newSubscription,
        updatedat: new Date(),
      },
    });

  return subscription;
}
