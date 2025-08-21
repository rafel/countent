import {
  createSubscription,
  createSubscriptionPayer,
  addCompanyToSubscription,
  addUserToSubscription,
  removeCompanyFromSubscription,
  removeUserFromSubscription,
  getSubscriptionCompanies,
  getSubscriptionUsers,
} from "@/lib/db/queries/subscription";
import type { SubscriptionPlans } from "@/content/common";

/**
 * Business logic for creating different types of subscriptions
 */

// Create a B2C personal subscription (user only, no companies)
export async function createPersonalSubscription(
  userId: string,
  userEmail: string,
  userName: string,
  plan: SubscriptionPlans,
  stripeCustomerId: string,
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

// Create a B2C company subscription (user pays, covers specific companies)
export async function createCompanySubscription(
  userId: string,
  userEmail: string,
  userName: string,
  companyIds: string[],
  plan: SubscriptionPlans,
  stripeCustomerId: string,
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

  // 3. Add companies to subscription
  for (const companyId of companyIds) {
    await addCompanyToSubscription(subscription.subscriptionid, companyId);
  }

  // 4. Grant access to the billing owner
  await addUserToSubscription(subscription.subscriptionid, userId);

  return { payer, subscription };
}

// Create a B2B subscription (company pays, all members get access)
export async function createTeamSubscription(
  companyId: string,
  companyEmail: string,
  companyName: string,
  memberUserIds: string[],
  plan: SubscriptionPlans,
  stripeCustomerId: string,
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
 * Business logic for managing subscription access
 */

// Add a company to an existing subscription
export async function grantCompanyAccess(
  subscriptionId: string,
  companyId: string
) {
  await addCompanyToSubscription(subscriptionId, companyId);
}

// Remove a company from subscription
export async function revokeCompanyAccess(
  subscriptionId: string,
  companyId: string
) {
  await removeCompanyFromSubscription(subscriptionId, companyId);
}

// Add a user to an existing subscription
export async function grantUserAccess(subscriptionId: string, userId: string) {
  await addUserToSubscription(subscriptionId, userId);
}

// Remove a user from subscription
export async function revokeUserAccess(subscriptionId: string, userId: string) {
  await removeUserFromSubscription(subscriptionId, userId);
}

/**
 * Business logic for handling user/company lifecycle events
 */

// Handle when a user leaves a company
export async function handleUserLeavingCompany(
  userId: string,
  companyId: string
) {
  // TODO: Implement logic based on your business rules
  // Options:
  // 1. If user is billing owner of company subscription → transfer ownership
  // 2. If user has personal access → revoke it
  // 3. If company subscription covers user → remove user access

  console.log(
    `User ${userId} leaving company ${companyId} - implement business logic`
  );
}

// Handle when a user deletes their account
export async function handleUserAccountDeletion(userId: string) {
  // TODO: Implement logic based on your business rules
  // Options:
  // 1. Transfer billing ownership of all subscriptions they own
  // 2. Cancel subscriptions if no suitable owner found
  // 3. Notify affected companies/users

  console.log(`User ${userId} deleting account - implement business logic`);
}

// Handle when a company is deleted
export async function handleCompanyDeletion(companyId: string) {
  // TODO: Implement logic based on your business rules
  // Options:
  // 1. Remove company from all subscriptions
  // 2. Notify subscription owners
  // 3. Handle billing adjustments if needed

  console.log(`Company ${companyId} being deleted - implement business logic`);
}

/**
 * Utility functions for subscription management
 */

// Get all entities covered by a subscription
export async function getSubscriptionCoverage(subscriptionId: string) {
  const [companies, users] = await Promise.all([
    getSubscriptionCompanies(subscriptionId),
    getSubscriptionUsers(subscriptionId),
  ]);

  return {
    companies,
    users,
  };
}

// Check if a subscription can be safely deleted
export async function canDeleteSubscription(subscriptionId: string): Promise<{
  canDelete: boolean;
  blockers: string[];
}> {
  const coverage = await getSubscriptionCoverage(subscriptionId);
  const blockers: string[] = [];

  if (coverage.companies.length > 0) {
    blockers.push(
      `${coverage.companies.length} companies depend on this subscription`
    );
  }

  if (coverage.users.length > 1) {
    blockers.push(
      `${coverage.users.length} users have access to this subscription`
    );
  }

  return {
    canDelete: blockers.length === 0,
    blockers,
  };
}
