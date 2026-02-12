import { PlanTier } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plans";
import { getPlanForUser } from "@/lib/billing";
import { exportSettingsSchema } from "@/lib/export-config";
import { renderExport } from "@/lib/export-renderer";

export async function POST(request: Request) {
  const user = await requireUser();
  const json = await request.json();
  const parsed = exportSettingsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid export payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "User provisioning failed" }, { status: 500 });
  }

  const plan = getPlanForUser(dbUser);
  const limits = PLAN_LIMITS[plan];

  if (plan === PlanTier.FREE) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const exportsToday = await prisma.export.count({
      where: {
        userId: dbUser.id,
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    if (exportsToday >= limits.maxExportsPerDay) {
      return NextResponse.json(
        { error: "Daily export limit reached", code: "EXPORT_LIMIT_REACHED", message: "Free plan allows 5 exports per day. Upgrade to Pro for unlimited exports." },
        { status: 429 },
      );
    }
  }

  try {
    const render = await renderExport(parsed.data, limits.watermark, limits.maxWidth, limits.maxHeight);

    await prisma.export.create({
      data: {
        userId: dbUser.id,
        width: render.width,
        height: render.height,
        watermarkApplied: render.watermarkApplied,
        planAtTime: plan,
      },
    });

    return new NextResponse(render.buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="snapframe-export.png"',
        "X-Snapframe-Watermark": String(render.watermarkApplied),
        "X-Snapframe-Plan": plan,
      },
    });
  } catch (error) {
    console.error("Export failed", error);
    return NextResponse.json({ error: "Export failed to render" }, { status: 500 });
  }
}
