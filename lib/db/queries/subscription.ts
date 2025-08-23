import { eq, and, or, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  subscriptions,
  subscriptionpayers,
  subscriptioncompanies,
  subscriptionusers,
  type Subscription,
  type NewSubscription,
  type SubscriptionPayer,
  type NewSubscriptionPayer,
  type SubscriptionCompany,
  type SubscriptionUser,
} from "@/lib/db/schema";
import { commonSettings, SubscriptionPlans } from "@/content/common";
import { SubscriptionAccess } from "../tables/subscription";

// ============================================================================
// SUBSCRIPTION PAYER CRUD
// ============================================================================

// Create a new subscription payer
export async function createSubscriptionPayer(
  data: NewSubscriptionPayer
): Promise<SubscriptionPayer> {
  const [payer] = await db
    .insert(subscriptionpayers)
    .values({
      ...data,
      updatedat: new Date(),
    })
    .returning();

  return payer;
}

// Get subscription payer by ID
export async function getSubscriptionPayerById(
  payerId: string
): Promise<SubscriptionPayer | null> {
  const [payer] = await db
    .select()
    .from(subscriptionpayers)
    .where(eq(subscriptionpayers.subscriptionpayerid, payerId))
    .limit(1);

  return payer || null;
}

// Get subscription payer by Stripe customer ID
export async function getSubscriptionPayerByStripeId(
  stripeCustomerId: string
): Promise<SubscriptionPayer | null> {
  const [payer] = await db
    .select()
    .from(subscriptionpayers)
    .where(eq(subscriptionpayers.stripecustomerid, stripeCustomerId))
    .limit(1);

  return payer || null;
}

// Update subscription payer
export async function updateSubscriptionPayer(
  payerId: string,
  data: Partial<NewSubscriptionPayer>
): Promise<SubscriptionPayer | null> {
  const [payer] = await db
    .update(subscriptionpayers)
    .set({
      ...data,
      updatedat: new Date(),
    })
    .where(eq(subscriptionpayers.subscriptionpayerid, payerId))
    .returning();

  return payer || null;
}

export async function updateSubscriptionSubscriptionPayerId(
  subscriptionId: string,
  payerId: string
): Promise<SubscriptionPayer | null> {
  const [payer] = await db
    .update(subscriptionpayers)
    .set({
      subscriptionpayerid: payerId,
      updatedat: new Date(),
    })
    .where(eq(subscriptions.subscriptionid, subscriptionId))
    .returning();
  return payer;
}

export async function getPayerBySubscriptionId(
  subscriptionId: string
): Promise<SubscriptionPayer | null> {
  const currentSubscription = await getSubscriptionById(subscriptionId);
  const payer = await getSubscriptionPayerById(
    currentSubscription?.subscriptionpayerid || ""
  );
  return payer || null;
}

// ============================================================================
// CORE SUBSCRIPTION CRUD
// ============================================================================

// Create a B2C personal subscription
export async function createPersonalSubscription(
  userId: string,
  userEmail: string = "",
  userName: string = "",
  plan: SubscriptionPlans = "free",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  // 1. Create user payer
  const payer = await createSubscriptionPayer({
    payertype: "user",
    userid: userId,
    companyid: null,
    stripecustomerid: stripeCustomerId,
    billingemail: userEmail,
    billingname: userName,
  });

  // 2. Create subscription
  const subscription = await createSubscription({
    subscriptionpayerid: payer.subscriptionpayerid,
    plan,
    status: "active",
    stripesubscriptionid: stripeSubscriptionId,
  });

  // 3. Grant access to the user
  await addUserToSubscription(subscription.subscriptionid, userId);

  return { payer, subscription };
}

// Create a B2B subscription (company pays, all members get access)
export async function createTeamSubscription(
  companyId: string,
  companyEmail: string = "",
  companyName: string = "",
  memberUserIds: string[] = [],
  plan: SubscriptionPlans = "free",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  // 1. Create company payer
  const payer = await createSubscriptionPayer({
    payertype: "company",
    userid: null,
    companyid: companyId,
    stripecustomerid: stripeCustomerId,
    billingemail: companyEmail,
    billingname: companyName,
  });

  // 2. Create subscription
  const subscription = await createSubscription({
    subscriptionpayerid: payer.subscriptionpayerid,
    plan,
    status: "active",
    stripesubscriptionid: stripeSubscriptionId,
  });

  // 3. Add company to subscription (all company members get access)
  await addCompanyToSubscription(subscription.subscriptionid, companyId);

  // 4. Optionally grant explicit access to specific users
  for (const userId of memberUserIds) {
    await addUserToSubscription(subscription.subscriptionid, userId);
  }

  return { payer, subscription };
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
    if (!currentSubscription) {
      return {
        hasAccess: false,
        plan: "free",
        hasBillingPage: false,
      };
    }

    const payer = await getSubscriptionPayerById(
      currentSubscription.subscriptionpayerid
    );

    return {
      hasAccess: true,
      plan: currentSubscription.plan,
      hasBillingPage: payer?.stripecustomerid ? true : false,
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

// Create a new subscription
export async function createSubscription(
  data: NewSubscription
): Promise<Subscription> {
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      ...data,
      updatedat: new Date(),
    })
    .returning();

  return subscription;
}

// Get subscription by ID
export async function getSubscriptionById(
  subscriptionId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.subscriptionid, subscriptionId))
    .limit(1);

  return subscription || null;
}

// Get subscription by Stripe subscription ID
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripesubscriptionid, stripeSubscriptionId))
    .limit(1);

  return subscription || null;
}

// Update subscription
export async function updateSubscription(
  subscriptionId: string,
  data: Partial<NewSubscription>
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      ...data,
      updatedat: new Date(),
    })
    .where(eq(subscriptions.subscriptionid, subscriptionId))
    .returning();

  return subscription || null;
}

// Update subscription by Stripe ID
export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<NewSubscription>
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      ...data,
      updatedat: new Date(),
    })
    .where(eq(subscriptions.stripesubscriptionid, stripeSubscriptionId))
    .returning();

  return subscription || null;
}

// ============================================================================
// SUBSCRIPTION ACCESS QUERIES
// ============================================================================

export async function getCurrentSubscription(
  userId: string,
  companyId: string
): Promise<Subscription | null> {
  if (commonSettings.subscriptionModel === "b2b") {
    if (!companyId) {
      throw new Error("Company ID is required for B2B subscriptions");
    }
    const currentSubscription = await getCompanySubscriptions(companyId);
    return currentSubscription[0] || null;
  } else {
    const currentSubscription = await getUserAllSubscriptions(userId);
    return currentSubscription[0] || null;
  }
}

// Get active subscriptions where user is the payer (billing owner)
export async function getUserOwnedSubscriptions(
  userId: string
): Promise<Subscription[]> {
  const results = await db
    .select({
      subscriptionid: subscriptions.subscriptionid,
      subscriptionpayerid: subscriptions.subscriptionpayerid,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripesubscriptionid: subscriptions.stripesubscriptionid,
      currentperiodend: subscriptions.currentperiodend,
      cancelat: subscriptions.cancelat,
      canceledat: subscriptions.canceledat,
      createdat: subscriptions.createdat,
      updatedat: subscriptions.updatedat,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptionpayers,
      eq(
        subscriptions.subscriptionpayerid,
        subscriptionpayers.subscriptionpayerid
      )
    )
    .where(
      and(
        eq(subscriptionpayers.payertype, "user"),
        eq(subscriptionpayers.userid, userId),
        or(
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "trialing")
        )
      )
    )
    .orderBy(desc(subscriptions.createdat));

  return results;
}

// Get active subscriptions where user has access (either as payer or granted access)
export async function getUserActiveSubscriptions(
  userId: string
): Promise<Subscription[]> {
  // Get subscriptions where user is the payer
  const ownedSubs = await getUserOwnedSubscriptions(userId);

  // Get subscriptions where user has been granted access
  const grantedSubs = await db
    .select({
      subscriptionid: subscriptions.subscriptionid,
      subscriptionpayerid: subscriptions.subscriptionpayerid,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripesubscriptionid: subscriptions.stripesubscriptionid,
      currentperiodend: subscriptions.currentperiodend,
      cancelat: subscriptions.cancelat,
      canceledat: subscriptions.canceledat,
      createdat: subscriptions.createdat,
      updatedat: subscriptions.updatedat,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptionusers,
      eq(subscriptions.subscriptionid, subscriptionusers.subscriptionid)
    )
    .where(
      and(
        eq(subscriptionusers.userid, userId),
        or(
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "trialing")
        )
      )
    )
    .orderBy(desc(subscriptions.createdat));

  // Combine and deduplicate
  const allSubs = [...ownedSubs, ...grantedSubs];
  const uniqueSubs = allSubs.filter(
    (sub, index, self) =>
      index === self.findIndex((s) => s.subscriptionid === sub.subscriptionid)
  );

  return uniqueSubs;
}

// Get active subscriptions that cover a specific company
export async function getCompanyActiveSubscriptions(
  companyId: string
): Promise<Subscription[]> {
  const results = await db
    .select({
      subscriptionid: subscriptions.subscriptionid,
      subscriptionpayerid: subscriptions.subscriptionpayerid,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripesubscriptionid: subscriptions.stripesubscriptionid,
      currentperiodend: subscriptions.currentperiodend,
      cancelat: subscriptions.cancelat,
      canceledat: subscriptions.canceledat,
      createdat: subscriptions.createdat,
      updatedat: subscriptions.updatedat,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptioncompanies,
      eq(subscriptions.subscriptionid, subscriptioncompanies.subscriptionid)
    )
    .where(
      and(
        eq(subscriptioncompanies.companyid, companyId),
        or(
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "trialing")
        )
      )
    )
    .orderBy(desc(subscriptions.createdat));

  return results;
}

// Get all subscriptions for a user (as payer) - includes inactive
export async function getUserSubscriptions(
  userId: string
): Promise<Subscription[]> {
  const results = await db
    .select({
      subscriptionid: subscriptions.subscriptionid,
      subscriptionpayerid: subscriptions.subscriptionpayerid,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripesubscriptionid: subscriptions.stripesubscriptionid,
      currentperiodend: subscriptions.currentperiodend,
      cancelat: subscriptions.cancelat,
      canceledat: subscriptions.canceledat,
      createdat: subscriptions.createdat,
      updatedat: subscriptions.updatedat,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptionpayers,
      eq(
        subscriptions.subscriptionpayerid,
        subscriptionpayers.subscriptionpayerid
      )
    )
    .where(
      and(
        eq(subscriptionpayers.payertype, "user"),
        eq(subscriptionpayers.userid, userId)
      )
    )
    .orderBy(desc(subscriptions.createdat));

  return results;
}

// Get all subscriptions that cover a specific company - includes inactive
export async function getCompanySubscriptions(
  companyId: string
): Promise<Subscription[]> {
  const results = await db
    .select({
      subscriptionid: subscriptions.subscriptionid,
      subscriptionpayerid: subscriptions.subscriptionpayerid,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripesubscriptionid: subscriptions.stripesubscriptionid,
      currentperiodend: subscriptions.currentperiodend,
      cancelat: subscriptions.cancelat,
      canceledat: subscriptions.canceledat,
      createdat: subscriptions.createdat,
      updatedat: subscriptions.updatedat,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptioncompanies,
      eq(subscriptions.subscriptionid, subscriptioncompanies.subscriptionid)
    )
    .where(eq(subscriptioncompanies.companyid, companyId))
    .orderBy(desc(subscriptions.createdat));

  return results;
}

// Get all subscriptions where user has access (either as payer or granted access) - includes inactive
export async function getUserAllSubscriptions(
  userId: string
): Promise<Subscription[]> {
  // Get subscriptions where user is the payer (includes inactive)
  const ownedSubs = await getUserSubscriptions(userId);

  // Get subscriptions where user has been granted access (includes inactive)
  const grantedSubs = await db
    .select({
      subscriptionid: subscriptions.subscriptionid,
      subscriptionpayerid: subscriptions.subscriptionpayerid,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripesubscriptionid: subscriptions.stripesubscriptionid,
      currentperiodend: subscriptions.currentperiodend,
      cancelat: subscriptions.cancelat,
      canceledat: subscriptions.canceledat,
      createdat: subscriptions.createdat,
      updatedat: subscriptions.updatedat,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptionusers,
      eq(subscriptions.subscriptionid, subscriptionusers.subscriptionid)
    )
    .where(eq(subscriptionusers.userid, userId))
    .orderBy(desc(subscriptions.createdat));

  // Combine and deduplicate
  const allSubs = [...ownedSubs, ...grantedSubs];
  const uniqueSubs = allSubs.filter(
    (sub, index, self) =>
      index === self.findIndex((s) => s.subscriptionid === sub.subscriptionid)
  );

  return uniqueSubs;
}

// ============================================================================
// SUBSCRIPTION COMPANY RELATIONSHIP CRUD
// ============================================================================

// Add company to subscription
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

// ============================================================================
// SUBSCRIPTION USER RELATIONSHIP CRUD
// ============================================================================

// Grant user access to subscription
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

/**
 * Business logic for creating different types of subscriptions
 */

/**
 * Get subscription plan from Stripe price lookup key
 */
