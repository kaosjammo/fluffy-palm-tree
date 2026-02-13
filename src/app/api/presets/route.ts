import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUsePreset } from "@/lib/plans";
import { getPlanForUser } from "@/lib/billing";

export async function POST(request: Request) {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });

  if (!dbUser) {
    return NextResponse.json({ error: "User provisioning failed" }, { status: 500 });
  }

  if (!canUsePreset(getPlanForUser(dbUser))) {
    return NextResponse.json({ error: "Saved presets are a Pro feature" }, { status: 403 });
  }

  const payload = (await request.json()) as {
    name: string;
    padding: number;
    background: string;
    backgroundValue: string;
    frameType: "NONE" | "BROWSER" | "IPHONE" | "MAC";
    radius: number;
    shadow: number;
  };

  const preset = await prisma.preset.create({
    data: {
      userId: dbUser.id,
      ...payload,
    },
  });

  return NextResponse.json({ preset });
}
