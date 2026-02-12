import { PlanTier } from "@prisma/client";

export const PLAN_LIMITS = {
  [PlanTier.FREE]: {
    maxExportsPerDay: 5,
    maxResolution: "1080p",
    watermark: true,
    presets: false,
  },
  [PlanTier.PRO]: {
    maxExportsPerDay: Number.POSITIVE_INFINITY,
    maxResolution: "4k",
    watermark: false,
    presets: true,
  },
};

export const canUsePreset = (plan: PlanTier) => PLAN_LIMITS[plan].presets;
