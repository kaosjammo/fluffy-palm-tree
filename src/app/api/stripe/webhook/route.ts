import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { downgradeUserToFree, registerStripeEvent, syncUserBillingFromSubscription, unregisterStripeEvent } from "@/lib/billing";

export const runtime = "nodejs";

function unmapped(event: Stripe.Event, reason: string): never {
  throw new Error(`Unmapped Stripe event ${event.id} (${event.type}): ${reason}`);
}

export async function POST(request: Request) {
  const env = getEnv();
  const stripe = getStripe();

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json({ error: "Invalid Stripe signature", details: String(error) }, { status: 400 });
  }

  console.info("Stripe webhook received", { eventId: event.id, eventType: event.type });

  const shouldProcess = await registerStripeEvent(event);
  if (!shouldProcess) {
    console.info("Stripe webhook duplicate ignored", { eventId: event.id, eventType: event.type });
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadataUserId = session.metadata?.appUserId;
        const customerId = typeof session.customer === "string" ? session.customer : null;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
        const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

        if (!customerId) {
          unmapped(event, "Missing customerId on checkout.session.completed");
        }

        const dbUser =
          (metadataUserId
            ? await prisma.user.findUnique({
                where: { id: metadataUserId },
              })
            : null) ??
          (customerEmail
            ? await prisma.user.findUnique({
                where: { email: customerEmail },
              })
            : null);

        if (!dbUser) {
          unmapped(event, "Could not map checkout session to a user");
        }

        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            lastWebhookUpdateAt: new Date(),
          },
        });

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncUserBillingFromSubscription({
            userId: dbUser.id,
            stripeCustomerId: customerId,
            subscription,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
        if (!customerId) {
          unmapped(event, "Missing customerId on subscription event");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ stripeCustomerId: customerId }, { stripeSubscriptionId: subscription.id }],
          },
        });

        if (!user) {
          unmapped(event, "Could not map subscription event to a user");
        }

        await syncUserBillingFromSubscription({
          userId: user.id,
          stripeCustomerId: customerId,
          subscription,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
        if (!customerId) {
          unmapped(event, "Missing customerId on subscription.deleted");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ stripeCustomerId: customerId }, { stripeSubscriptionId: subscription.id }],
          },
        });

        if (!user) {
          unmapped(event, "Could not map subscription.deleted to a user");
        }

        await downgradeUserToFree({
          userId: user.id,
          stripeCustomerId: customerId,
          subscriptionId: subscription.id,
        });
        break;
      }

      default:
        break;
    }

    console.info("Stripe webhook processed", { eventId: event.id, eventType: event.type });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Stripe webhook handling failed", { eventId: event.id, eventType: event.type, error: String(error) });
    await unregisterStripeEvent(event.id);
    return NextResponse.json({ error: "Webhook handler failed", details: String(error) }, { status: 500 });
  }
}
