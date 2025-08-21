import "server-only";

// Utility functions for handling subscription and payment data
// These are placeholder functions that you can implement based on your database schema

export interface PaymentRecord {
  invoiceId: string;
  customerId: string | null;
  subscriptionId: string | null;
  amountPaid?: number;
  amountDue?: number;
  currency: string;
  status: "paid" | "failed" | "pending";
  paidAt?: Date;
  attemptCount?: number;
  nextAttemptAt?: Date | null;
  billingReason?: string | null;
}

export interface SubscriptionStatus {
  subscriptionId: string;
  customerId: string;
  status: "active" | "past_due" | "canceled" | "unpaid" | "trialing";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  lastPaymentAt?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface NotificationData {
  customerEmail: string | null;
  customerName: string | null;
  invoiceId: string;
  amountDue?: number;
  amountPaid?: number;
  currency: string;
  nextAttemptAt?: Date | null;
}

// TODO: Implement these functions based on your database schema

export async function updatePaymentRecord(data: PaymentRecord): Promise<void> {
  console.log("TODO: Update payment record in database:", data);

  // Example implementation:
  // await db.insert(payments).values({
  //   invoiceId: data.invoiceId,
  //   customerId: data.customerId,
  //   subscriptionId: data.subscriptionId,
  //   amountPaid: data.amountPaid,
  //   amountDue: data.amountDue,
  //   currency: data.currency,
  //   status: data.status,
  //   paidAt: data.paidAt,
  //   attemptCount: data.attemptCount,
  //   nextAttemptAt: data.nextAttemptAt,
  //   createdAt: new Date(),
  // });
}

export async function updateUserSubscriptionStatus(
  data: SubscriptionStatus
): Promise<void> {
  console.log("TODO: Update user subscription status in database:", data);

  // Example implementation:
  // await db.update(userSubscriptions)
  //   .set({
  //     status: data.status,
  //     currentPeriodStart: data.currentPeriodStart,
  //     currentPeriodEnd: data.currentPeriodEnd,
  //     lastPaymentAt: data.lastPaymentAt,
  //     cancelAtPeriodEnd: data.cancelAtPeriodEnd,
  //     updatedAt: new Date(),
  //   })
  //   .where(eq(userSubscriptions.subscriptionId, data.subscriptionId));
}

export async function findUserByCustomerId(
  customerId: string
): Promise<{ id: string; email: string } | null> {
  console.log("TODO: Find user by Stripe customer ID:", customerId);

  // Example implementation:
  // const [user] = await db.select()
  //   .from(users)
  //   .where(eq(users.stripeCustomerId, customerId))
  //   .limit(1);
  //
  // return user || null;

  return null;
}

export async function updateUserType(
  userId: string,
  userType: "regular" | "pro" | "enterprise"
): Promise<void> {
  console.log("TODO: Update user type based on subscription:", {
    userId,
    userType,
  });

  // Example implementation:
  // await db.update(users)
  //   .set({ type: userType, updatedAt: new Date() })
  //   .where(eq(users.id, userId));
}

export async function sendPaymentSuccessNotification(
  data: NotificationData
): Promise<void> {
  console.log("TODO: Send payment success notification:", data);

  // Example implementation:
  // await sendEmail({
  //   to: data.customerEmail,
  //   subject: 'Payment Successful',
  //   template: 'payment-success',
  //   data: {
  //     customerName: data.customerName,
  //     amountPaid: data.amountPaid,
  //     currency: data.currency,
  //     invoiceId: data.invoiceId,
  //   },
  // });
}

export async function sendPaymentFailedNotification(
  data: NotificationData
): Promise<void> {
  console.log("TODO: Send payment failed notification:", data);

  // Example implementation:
  // await sendEmail({
  //   to: data.customerEmail,
  //   subject: 'Payment Failed',
  //   template: 'payment-failed',
  //   data: {
  //     customerName: data.customerName,
  //     amountDue: data.amountDue,
  //     currency: data.currency,
  //     invoiceId: data.invoiceId,
  //     nextAttemptAt: data.nextAttemptAt,
  //   },
  // });
}

export async function sendTrialEndingNotification(
  subscriptionId: string
): Promise<void> {
  console.log(
    "TODO: Send trial ending notification for subscription:",
    subscriptionId
  );

  // Example implementation:
  // const subscription = await findSubscriptionById(subscriptionId);
  // if (subscription?.user?.email) {
  //   await sendEmail({
  //     to: subscription.user.email,
  //     subject: 'Your trial is ending soon',
  //     template: 'trial-ending',
  //     data: {
  //       customerName: subscription.user.name,
  //       trialEndDate: subscription.trialEnd,
  //     },
  //   });
  // }
}

// Helper function to determine user type based on Stripe price/product
export function getUserTypeFromStripeData(
  priceId?: string,
  productId?: string
): "regular" | "pro" | "enterprise" {
  // TODO: Map your Stripe price/product IDs to user types
  if (priceId?.includes("pro") || productId?.includes("pro")) {
    return "pro";
  }
  if (priceId?.includes("enterprise") || productId?.includes("enterprise")) {
    return "enterprise";
  }
  return "regular";
}
