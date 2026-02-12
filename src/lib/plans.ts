import { PlanTier } from "@prisma/client";

export const PLAN_LIMITS = {
  [PlanTier.FREE]: {
    maxExportsPerDay: 5,
    maxResolution: "1080p",
    maxWidth: 1920,
    maxHeight: 1080,
    watermark: true,
    presets: false,
  },
  [PlanTier.PRO]: {
    maxExportsPerDay: Number.POSITIVE_INFINITY,
    maxResolution: "4k",
    maxWidth: 3840,
    maxHeight: 2160,
    watermark: false,
    presets: true,
  },
};

export const canUsePreset = (plan: PlanTier) => PLAN_LIMITS[plan].presets;
