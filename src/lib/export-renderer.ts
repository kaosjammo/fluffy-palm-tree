import sharp from "sharp";
import { ExportSettingsInput } from "@/lib/export-config";

const WATERMARK_HEIGHT = 38;

type RenderResult = {
  buffer: Buffer;
  width: number;
  height: number;
  watermarkApplied: boolean;
};

function parseDataUrl(dataUrl: string) {
  const index = dataUrl.indexOf(",");
  if (index < 0) {
    throw new Error("Invalid image data URL");
  }

  return Buffer.from(dataUrl.slice(index + 1), "base64");
}

function getFrameBorder(frame: ExportSettingsInput["frame"]) {
  if (frame === "BROWSER" || frame === "MAC") return 8;
  if (frame === "IPHONE") return 14;
  return 0;
}

function getBackground(background: ExportSettingsInput["background"]) {
  if (background === "SOLID") return "#1e1b4b";
  if (background === "BLUR") return "#334155";
  return "url(#bgGradient)";
}

export async function renderExport(settings: ExportSettingsInput, withWatermark: boolean, maxWidth: number, maxHeight: number): Promise<RenderResult> {
  const source = parseDataUrl(settings.imageDataUrl);
  const sourceMeta = await sharp(source).metadata();

  if (!sourceMeta.width || !sourceMeta.height) {
    throw new Error("Could not read source image dimensions");
  }

  const frameBorder = getFrameBorder(settings.frame);
  const contentWidth = sourceMeta.width + frameBorder * 2;
  const contentHeight = sourceMeta.height + frameBorder * 2;

  const canvasWidth = contentWidth + settings.padding * 2;
  const canvasHeight = contentHeight + settings.padding * 2 + (withWatermark ? WATERMARK_HEIGHT : 0);

  const scale = Math.min(1, maxWidth / canvasWidth, maxHeight / canvasHeight);
  const finalWidth = Math.max(1, Math.round(canvasWidth * scale));
  const finalHeight = Math.max(1, Math.round(canvasHeight * scale));

  const scaledPadding = settings.padding * scale;
  const scaledFrame = frameBorder * scale;
  const scaledRadius = Math.max(0, settings.radius * scale);
  const scaledShadow = settings.shadow * scale;
  const imageX = scaledPadding + scaledFrame;
  const imageY = scaledPadding + scaledFrame;
  const scaledImageWidth = sourceMeta.width * scale;
  const scaledImageHeight = sourceMeta.height * scale;

  const backgroundFill = getBackground(settings.background);

  const svg = `
  <svg width="${finalWidth}" height="${finalHeight}" viewBox="0 0 ${finalWidth} ${finalHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#4f46e5" />
        <stop offset="100%" stop-color="#d946ef" />
      </linearGradient>
      <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="20" stdDeviation="${Math.max(0, scaledShadow / 2)}" flood-color="rgba(15, 23, 42, 0.55)"/>
      </filter>
      <clipPath id="sourceClip">
        <rect x="${imageX}" y="${imageY}" width="${scaledImageWidth}" height="${scaledImageHeight}" rx="${scaledRadius}" ry="${scaledRadius}" />
      </clipPath>
    </defs>

    <rect x="0" y="0" width="${finalWidth}" height="${finalHeight}" fill="${backgroundFill}" rx="${scaledRadius}" ry="${scaledRadius}" filter="url(#dropShadow)" />
    <rect x="${scaledPadding}" y="${scaledPadding}" width="${scaledImageWidth + scaledFrame * 2}" height="${scaledImageHeight + scaledFrame * 2}" fill="${settings.frame === "MAC" ? "#cbd5e1" : settings.frame === "IPHONE" ? "#000000" : settings.frame === "BROWSER" ? "#0f172a" : "transparent"}" rx="${settings.frame === "IPHONE" ? 38 * scale : scaledRadius}" ry="${settings.frame === "IPHONE" ? 38 * scale : scaledRadius}"/>
    <image href="${settings.imageDataUrl}" x="${imageX}" y="${imageY}" width="${scaledImageWidth}" height="${scaledImageHeight}" clip-path="url(#sourceClip)" preserveAspectRatio="none"/>
    ${
      withWatermark
        ? `<rect x="0" y="${finalHeight - WATERMARK_HEIGHT}" width="${finalWidth}" height="${WATERMARK_HEIGHT}" fill="rgba(15,23,42,0.72)" />
           <text x="${finalWidth / 2}" y="${finalHeight - 14}" text-anchor="middle" font-size="16" fill="#ffffff" font-family="Inter, Arial, sans-serif">Made with Snapframe</text>`
        : ""
    }
  </svg>`;

  const output = await sharp(Buffer.from(svg)).png().toBuffer();

  return {
    buffer: output,
    width: finalWidth,
    height: finalHeight,
    watermarkApplied: withWatermark,
  };
}
