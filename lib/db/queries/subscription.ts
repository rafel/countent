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

// Get payers for a user
export async function getUserPayers(
  userId: string
): Promise<SubscriptionPayer[]> {
  return await db
    .select()
    .from(subscriptionpayers)
    .where(
      and(
        eq(subscriptionpayers.payertype, "user"),
        eq(subscriptionpayers.userid, userId)
      )
    )
    .orderBy(desc(subscriptionpayers.createdat));
}

// Get payers for a company
export async function getCompanyPayers(
  companyId: string
): Promise<SubscriptionPayer[]> {
  return await db
    .select()
    .from(subscriptionpayers)
    .where(
      and(
        eq(subscriptionpayers.payertype, "company"),
        eq(subscriptionpayers.companyid, companyId)
      )
    )
    .orderBy(desc(subscriptionpayers.createdat));
}

// ============================================================================
// CORE SUBSCRIPTION CRUD
// ============================================================================

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

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedat: new Date(),
    })
    .where(eq(subscriptions.subscriptionid, subscriptionId))
    .returning();

  return subscription || null;
}

// Transfer billing ownership (for when someone leaves company)
export async function transferBillingOwnership(
  subscriptionId: string,
  newPayerId: string
): Promise<Subscription | null> {
  const [subscription] = await db
    .update(subscriptions)
    .set({
      subscriptionpayerid: newPayerId,
      updatedat: new Date(),
    })
    .where(eq(subscriptions.subscriptionid, subscriptionId))
    .returning();

  return subscription || null;
}

// ============================================================================
// SUBSCRIPTION ACCESS QUERIES
// ============================================================================

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

// Remove company from subscription
export async function removeCompanyFromSubscription(
  subscriptionId: string,
  companyId: string
): Promise<void> {
  await db
    .delete(subscriptioncompanies)
    .where(
      and(
        eq(subscriptioncompanies.subscriptionid, subscriptionId),
        eq(subscriptioncompanies.companyid, companyId)
      )
    );
}

// Get companies covered by subscription
export async function getSubscriptionCompanies(
  subscriptionId: string
): Promise<string[]> {
  const companies = await db
    .select({ companyid: subscriptioncompanies.companyid })
    .from(subscriptioncompanies)
    .where(eq(subscriptioncompanies.subscriptionid, subscriptionId));

  return companies.map((c) => c.companyid);
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

// Remove user access from subscription
export async function removeUserFromSubscription(
  subscriptionId: string,
  userId: string
): Promise<void> {
  await db
    .delete(subscriptionusers)
    .where(
      and(
        eq(subscriptionusers.subscriptionid, subscriptionId),
        eq(subscriptionusers.userid, userId)
      )
    );
}

// Get users with access to subscription
export async function getSubscriptionUsers(
  subscriptionId: string
): Promise<string[]> {
  const users = await db
    .select({ userid: subscriptionusers.userid })
    .from(subscriptionusers)
    .where(eq(subscriptionusers.subscriptionid, subscriptionId));

  return users.map((u) => u.userid);
}

// ============================================================================
// CONVENIENCE FUNCTIONS (BACKWARD COMPATIBILITY)
// ============================================================================

// Get first active subscription for a user (for backward compatibility)
export async function getUserActiveSubscription(
  userId: string
): Promise<Subscription | null> {
  const subscriptions = await getUserActiveSubscriptions(userId);
  return subscriptions[0] || null;
}

// Get first active subscription for a company (for backward compatibility)
export async function getCompanyActiveSubscription(
  companyId: string
): Promise<Subscription | null> {
  const subscriptions = await getCompanyActiveSubscriptions(companyId);
  return subscriptions[0] || null;
}
