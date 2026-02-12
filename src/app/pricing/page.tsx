import { Header } from "@/components/header";

const plans = [
  {
    name: "Free",
    price: "$0",
    items: ["Watermark on exports", "5 exports/day", "No saved presets", "Max 1080p"],
  },
  {
    name: "Pro",
    price: "$15/mo",
    items: ["Unlimited exports", "No watermark", "Saved brand presets", "4K export"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto w-full max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">Pricing</h1>
        <p className="mt-2 text-slate-300">Simple pricing built for creators and product teams.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-fuchsia-300">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {plan.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
