import Stripe from "stripe";
import { getEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  if (!stripeClient) {
    const env = getEnv();
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }

  return stripeClient;
};
