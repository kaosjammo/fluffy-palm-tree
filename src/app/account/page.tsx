import Link from "next/link";
import { Header } from "@/components/header";

export default function AccountPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Account</h1>
        <p className="mt-2 text-slate-300">Manage your plan, billing, and export usage.</p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
          <p className="text-sm text-slate-200">Current plan: Free</p>
          <p className="mt-1 text-sm text-slate-200">Exports today: 0 / 5</p>
          <div className="mt-4 flex gap-3">
            <form action="/api/stripe/checkout" method="post">
              <button className="rounded-md bg-fuchsia-500 px-4 py-2 text-sm font-medium hover:bg-fuchsia-400">Upgrade to Pro</button>
            </form>
            <form action="/api/stripe/portal" method="post">
              <button className="rounded-md border border-white/15 px-4 py-2 text-sm font-medium hover:border-fuchsia-400">Open Billing Portal</button>
            </form>
          </div>
          <Link href="/pricing" className="mt-4 inline-block text-sm text-fuchsia-300 hover:text-fuchsia-200">
            Compare plans
          </Link>
        </div>
      </section>
    </main>
  );
}
