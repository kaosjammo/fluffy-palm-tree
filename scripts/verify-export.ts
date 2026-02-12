import assert from "node:assert/strict";
import sharp from "sharp";
import { renderExport } from "@/lib/export-renderer";
import { ExportSettingsInput } from "@/lib/export-config";

async function createFixture() {
  const svg = `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f97316"/><text x="40" y="120" font-size="64" fill="#111827">Snapframe fixture</text></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function readBottomCenterPixel(buffer: Buffer, width: number, height: number) {
  const pixel = await sharp(buffer)
    .extract({ left: Math.floor(width / 2), top: Math.max(0, height - 18), width: 1, height: 1 })
    .raw()
    .toBuffer();

  return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
}

async function run() {
  const imageDataUrl = await createFixture();
  const baseConfig: ExportSettingsInput = {
    imageDataUrl,
    padding: 48,
    radius: 24,
    shadow: 40,
    frame: "BROWSER",
    background: "GRADIENT",
  };

  const free = await renderExport(baseConfig, true, 1920, 1080);
  assert.ok(free.width <= 1920 && free.height <= 1080, "Free export must stay within 1080p bounds.");
  assert.equal(free.watermarkApplied, true, "Free export must apply watermark.");

  const pro = await renderExport(baseConfig, false, 3840, 2160);
  assert.ok(pro.width <= 3840 && pro.height <= 2160, "Pro export must stay within 4K bounds.");
  assert.equal(pro.watermarkApplied, false, "Pro export must not apply watermark.");

  const freePixel = await readBottomCenterPixel(free.buffer, free.width, free.height);
  const proPixel = await readBottomCenterPixel(pro.buffer, pro.width, pro.height);

  assert.notDeepEqual(freePixel, proPixel, "Expected watermark footer pixel to differ from non-watermarked export.");

  console.log("Export verification passed", {
    free: { width: free.width, height: free.height, watermarkApplied: free.watermarkApplied },
    pro: { width: pro.width, height: pro.height, watermarkApplied: pro.watermarkApplied },
  });
}

run().catch((error) => {
  console.error("Export verification failed", error);
  process.exit(1);
});
