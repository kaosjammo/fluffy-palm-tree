import { NextResponse } from "next/server";
import { PlanTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { width: number; height: number };

  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "User not provisioned" }, { status: 403 });
  }

  const now = new Date();
  const shouldReset = dbUser.exportResetAt.toDateString() !== now.toDateString();
  const exportsToday = shouldReset ? 0 : dbUser.exportsToday;
  const plan = dbUser.plan ?? PlanTier.FREE;
  const limits = PLAN_LIMITS[plan];

  if (exportsToday >= limits.maxExportsPerDay) {
    return NextResponse.json({ error: "Daily export limit reached" }, { status: 429 });
  }

  const maxPixels = limits.maxResolution === "4k" ? { w: 3840, h: 2160 } : { w: 1920, h: 1080 };
  if (body.width > maxPixels.w || body.height > maxPixels.h) {
    return NextResponse.json({ error: `Max export resolution for your plan is ${limits.maxResolution}` }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.export.create({
      data: {
        userId: dbUser.id,
        width: body.width,
        height: body.height,
        watermark: limits.watermark,
      },
    }),
    prisma.user.update({
      where: { id: dbUser.id },
      data: {
        exportsToday: exportsToday + 1,
        exportResetAt: now,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, watermark: limits.watermark });
}
