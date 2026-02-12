"use client";

import { ChangeEvent, useMemo, useState } from "react";

type FrameOption = "NONE" | "BROWSER" | "IPHONE" | "MAC";
type BackgroundOption = "SOLID" | "GRADIENT" | "BLUR";

const FRAMES: Array<{ label: string; value: FrameOption }> = [
  { label: "None", value: "NONE" },
  { label: "Browser", value: "BROWSER" },
  { label: "iPhone", value: "IPHONE" },
  { label: "Mac", value: "MAC" },
];

const BACKGROUNDS: Array<{ label: string; value: BackgroundOption }> = [
  { label: "Solid", value: "SOLID" },
  { label: "Gradient", value: "GRADIENT" },
  { label: "Blur", value: "BLUR" },
];

export function UploadEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(24);
  const [shadow, setShadow] = useState(40);
  const [frame, setFrame] = useState<FrameOption>("BROWSER");
  const [background, setBackground] = useState<BackgroundOption>("GRADIENT");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const wrapperStyle = useMemo(() => {
    const base = {
      padding: `${padding}px`,
      borderRadius: `${Math.max(radius, 0)}px`,
      boxShadow: `0 20px ${shadow}px rgba(15, 23, 42, 0.55)`,
    };

    if (background === "SOLID") {
      return { ...base, background: "#1e1b4b" };
    }

    if (background === "BLUR") {
      return {
        ...base,
        background: "#334155",
      };
    }

    return { ...base, background: "linear-gradient(140deg, #4f46e5, #d946ef)" };
  }, [background, padding, radius, shadow]);

  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
        setExportMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const frameClass =
    frame === "BROWSER"
      ? "border-8 border-slate-900"
      : frame === "IPHONE"
        ? "rounded-[38px] border-[14px] border-black"
        : frame === "MAC"
          ? "border-8 border-slate-300"
          : "";

  const onExport = async () => {
    if (!image) return;

    setIsExporting(true);
    setExportMessage(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          padding,
          radius,
          shadow,
          frame,
          background,
          imageDataUrl: image,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string; message?: string };
        setExportMessage(data.message ?? data.error ?? "Export failed.");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "snapframe-export.png";
      link.click();
      URL.revokeObjectURL(url);
      setExportMessage("Export generated.");
    } catch {
      setExportMessage("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <aside className="space-y-4 rounded-xl border border-white/10 bg-slate-900/70 p-4">
        <label className="block text-sm text-slate-200">
          Upload Screenshot
          <input type="file" accept="image/*" className="mt-2 w-full text-sm" onChange={onUpload} />
        </label>

        <label className="block text-sm">
          Padding: {padding}px
          <input type="range" min={0} max={120} value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="mt-2 w-full" />
        </label>

        <label className="block text-sm">
          Border Radius: {radius}px
          <input type="range" min={0} max={48} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="mt-2 w-full" />
        </label>

        <label className="block text-sm">
          Drop Shadow: {shadow}
          <input type="range" min={0} max={80} value={shadow} onChange={(e) => setShadow(Number(e.target.value))} className="mt-2 w-full" />
        </label>

        <label className="block text-sm">
          Background
          <select className="mt-2 w-full rounded-md border border-white/10 bg-slate-800 p-2" value={background} onChange={(e) => setBackground(e.target.value as BackgroundOption)}>
            {BACKGROUNDS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Template Frame
          <select className="mt-2 w-full rounded-md border border-white/10 bg-slate-800 p-2" value={frame} onChange={(e) => setFrame(e.target.value as FrameOption)}>
            {FRAMES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onExport}
          disabled={!image || isExporting}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? "Exporting..." : "Export PNG"}
        </button>

        {exportMessage ? <p className="text-sm text-slate-200">{exportMessage}</p> : null}
      </aside>

      <section className="rounded-xl border border-white/10 bg-slate-900/50 p-6">
        <div className="mx-auto flex min-h-[420px] items-center justify-center" style={wrapperStyle}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Uploaded preview" className={`max-h-[520px] rounded-xl object-contain ${frameClass}`} />
          ) : (
            <p className="text-sm text-slate-200">Upload a screenshot to preview your mockup.</p>
          )}
        </div>
      </section>
    </div>
  );
}
