import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase";

export const requireUser = async () => {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
};
