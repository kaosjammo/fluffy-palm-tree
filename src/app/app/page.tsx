import { UploadEditor } from "@/components/upload-editor";
import { Header } from "@/components/header";

export default function AppPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white">Editor</h1>
          <p className="text-sm text-slate-300">Free plan: 5 exports/day, watermark, up to 1080p.</p>
        </div>
        <UploadEditor />
      </section>
    </main>
  );
}
