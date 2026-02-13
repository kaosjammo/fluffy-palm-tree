import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const user = await requireUser();
  const env = getEnv();
  const stripe = getStripe();

  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });
  if (!dbUser) return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/account?error=no-user`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: dbUser.stripeCustomerId ?? undefined,
    customer_email: dbUser.email,
    client_reference_id: dbUser.id,
    metadata: {
      appUserId: dbUser.id,
      supabaseUserId: dbUser.supabaseUserId,
    },
    line_items: [{ price: env.STRIPE_PRICE_ID_PRO, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/account?upgraded=1`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return NextResponse.redirect(session.url!);
}
