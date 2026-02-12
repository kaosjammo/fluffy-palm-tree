"use client";

import { ChangeEvent, useMemo, useState } from "react";

const FRAMES = ["None", "Browser", "iPhone", "Mac"] as const;
const BACKGROUNDS = ["Solid", "Gradient", "Blur"] as const;

export function UploadEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [padding, setPadding] = useState(48);
  const [radius, setRadius] = useState(24);
  const [shadow, setShadow] = useState(40);
  const [frame, setFrame] = useState<(typeof FRAMES)[number]>("Browser");
  const [background, setBackground] = useState<(typeof BACKGROUNDS)[number]>("Gradient");

  const wrapperStyle = useMemo(() => {
    const base = {
      padding: `${padding}px`,
      borderRadius: `${Math.max(radius, 0)}px`,
      boxShadow: `0 20px ${shadow}px rgba(15, 23, 42, 0.55)`,
    };

    if (background === "Solid") {
      return { ...base, background: "#1e1b4b" };
    }

    if (background === "Blur") {
      return {
        ...base,
        background: "rgba(30, 41, 59, 0.6)",
        backdropFilter: "blur(18px)",
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
      }
    };
    reader.readAsDataURL(file);
  };

  const frameClass =
    frame === "Browser"
      ? "border-8 border-slate-900"
      : frame === "iPhone"
        ? "rounded-[38px] border-[14px] border-black"
        : frame === "Mac"
          ? "border-8 border-slate-300"
          : "";

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
          <select className="mt-2 w-full rounded-md border border-white/10 bg-slate-800 p-2" value={background} onChange={(e) => setBackground(e.target.value as (typeof BACKGROUNDS)[number])}>
            {BACKGROUNDS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Template Frame
          <select className="mt-2 w-full rounded-md border border-white/10 bg-slate-800 p-2" value={frame} onChange={(e) => setFrame(e.target.value as (typeof FRAMES)[number])}>
            {FRAMES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
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
