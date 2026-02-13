import { redirect } from "next/navigation";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export const provisionUserFromAuth = async (user: SupabaseAuthUser) => {
  if (!user.email) {
    throw new Error("Authenticated user is missing email");
  }

  return prisma.user.upsert({
    where: {
      supabaseUserId: user.id,
    },
    update: {
      email: user.email,
    },
    create: {
      supabaseUserId: user.id,
      email: user.email,
    },
  });
};

export const requireUser = async () => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await provisionUserFromAuth(user);

  return user;
};
