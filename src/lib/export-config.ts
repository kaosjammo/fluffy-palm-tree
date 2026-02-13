import { z } from "zod";

export const frameTypeSchema = z.enum(["NONE", "BROWSER", "IPHONE", "MAC"]);
export const backgroundTypeSchema = z.enum(["SOLID", "GRADIENT", "BLUR"]);

export const exportSettingsSchema = z.object({
  padding: z.number().int().min(0).max(240),
  radius: z.number().int().min(0).max(120),
  shadow: z.number().int().min(0).max(120),
  frame: frameTypeSchema,
  background: backgroundTypeSchema,
  imageDataUrl: z.string().startsWith("data:image/"),
});

export type ExportSettingsInput = z.infer<typeof exportSettingsSchema>;
