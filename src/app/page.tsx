import Link from "next/link";
import { Header } from "@/components/header";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <Header />
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.2em] text-fuchsia-300">Snapframe</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Turn raw screenshots into polished, shareable mockups in under 30 seconds.</h1>
          <p className="text-slate-300">Upload. Style. Export. Snapframe keeps the workflow minimal for builders and teams who ship often.</p>
          <div className="flex gap-3">
            <Link href="/app" className="rounded-md bg-fuchsia-500 px-4 py-2 font-medium text-white hover:bg-fuchsia-400">
              Start Editing
            </Link>
            <Link href="/pricing" className="rounded-md border border-white/15 px-4 py-2 font-medium text-slate-100 hover:border-fuchsia-400">
              View Pricing
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
          <ul className="space-y-3 text-sm text-slate-200">
            <li>• 1080p exports with watermark on Free</li>
            <li>• 4K exports with no watermark on Pro</li>
            <li>• Browser, iPhone, and Mac frames</li>
            <li>• Saved brand presets on Pro</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
