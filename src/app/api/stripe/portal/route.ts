import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getEnv } from "@/lib/env";

export async function POST() {
  const user = await requireUser();
  const env = getEnv();
  const stripe = getStripe();

  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });
  if (!dbUser?.stripeCustomerId) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/account?error=no-customer`);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${env.NEXT_PUBLIC_APP_URL}/account`,
  });

  return NextResponse.redirect(session.url);
}
