import { prisma } from "@/lib/prisma";
import { getPlanForUser } from "@/lib/billing";

function getArg(flag: string) {
  const index = process.argv.indexOf(flag);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = getArg("--email");
  const supabaseUserId = getArg("--supabase-user-id");

  if (!email && !supabaseUserId) {
    throw new Error("Provide --email or --supabase-user-id");
  }

  const user = await prisma.user.findFirst({
    where: email ? { email } : { supabaseUserId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const lastWebhookEvent = await prisma.stripeWebhookEvent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  console.log(
    JSON.stringify(
      {
        userId: user.id,
        email: user.email,
        planStored: user.plan,
        planDerived: getPlanForUser(user),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripePriceId: user.stripePriceId,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: user.currentPeriodEnd,
        lastWebhookUpdateAt: user.lastWebhookUpdateAt,
        lastProcessedWebhookEvent: lastWebhookEvent
          ? {
              stripeEventId: lastWebhookEvent.stripeEventId,
              stripeEventType: lastWebhookEvent.stripeEventType,
              createdAt: lastWebhookEvent.createdAt,
            }
          : null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
