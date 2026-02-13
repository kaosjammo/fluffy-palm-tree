import { PlanTier, Prisma, User } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function resolvePlanFromBilling(subscriptionStatus: string | null | undefined, stripePriceId: string | null | undefined) {
  const env = getEnv();

  if (subscriptionStatus && ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) && stripePriceId === env.STRIPE_PRICE_ID_PRO) {
    return PlanTier.PRO;
  }

  return PlanTier.FREE;
}

export function getPlanForUser(user: Pick<User, "subscriptionStatus" | "stripePriceId">) {
  return resolvePlanFromBilling(user.subscriptionStatus, user.stripePriceId);
}

export async function registerStripeEvent(event: Stripe.Event) {
  try {
    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        stripeEventType: event.type,
      },
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false;
    }

    throw error;
  }
}

export async function unregisterStripeEvent(eventId: string) {
  await prisma.stripeWebhookEvent.deleteMany({ where: { stripeEventId: eventId } });
}

export async function syncUserBillingFromSubscription(params: {
  userId: string;
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const priceId = params.subscription.items.data[0]?.price.id ?? null;
  const subscriptionStatus = params.subscription.status ?? null;
  const currentPeriodEnd = params.subscription.current_period_end ? new Date(params.subscription.current_period_end * 1000) : null;
  const plan = resolvePlanFromBilling(subscriptionStatus, priceId);

  return prisma.user.update({
    where: { id: params.userId },
    data: {
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.subscription.id,
      stripePriceId: priceId,
      subscriptionStatus,
      currentPeriodEnd,
      lastWebhookUpdateAt: new Date(),
      plan,
    },
  });
}

export async function downgradeUserToFree(params: { userId: string; stripeCustomerId: string; subscriptionId: string }) {
  return prisma.user.update({
    where: { id: params.userId },
    data: {
      stripeCustomerId: params.stripeCustomerId,
      stripeSubscriptionId: params.subscriptionId,
      stripePriceId: null,
      subscriptionStatus: "canceled",
      currentPeriodEnd: null,
      lastWebhookUpdateAt: new Date(),
      plan: PlanTier.FREE,
    },
  });
}
