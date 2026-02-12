import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanForUser } from "@/lib/billing";

export async function GET() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });

  if (!dbUser) {
    return NextResponse.json({ error: "User not provisioned" }, { status: 404 });
  }

  const lastWebhookEvent = await prisma.stripeWebhookEvent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    userId: dbUser.id,
    email: dbUser.email,
    planStored: dbUser.plan,
    planDerived: getPlanForUser(dbUser),
    stripeCustomerId: dbUser.stripeCustomerId,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripePriceId: dbUser.stripePriceId,
    subscriptionStatus: dbUser.subscriptionStatus,
    currentPeriodEnd: dbUser.currentPeriodEnd,
    lastWebhookUpdateAt: dbUser.lastWebhookUpdateAt,
    lastProcessedWebhookEvent: lastWebhookEvent
      ? {
          stripeEventId: lastWebhookEvent.stripeEventId,
          stripeEventType: lastWebhookEvent.stripeEventType,
          createdAt: lastWebhookEvent.createdAt,
        }
      : null,
  });
}
