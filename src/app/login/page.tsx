"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import { Header } from "@/components/header";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createSupabaseBrowser();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
      },
    });

    setMessage(error ? error.message : "Check your inbox for a secure sign-in link.");
  };

  const handleGoogleLogin = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
  };

  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto mt-16 w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">Login to Snapframe</h1>
        <p className="mt-2 text-sm text-slate-300">Use email magic links or Google.</p>

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2"
          />
          <button type="submit" className="w-full rounded-md bg-fuchsia-500 px-4 py-2 font-medium hover:bg-fuchsia-400">
            Email me a magic link
          </button>
        </form>

        <button onClick={handleGoogleLogin} className="mt-3 w-full rounded-md border border-white/15 px-4 py-2 font-medium hover:border-fuchsia-400">
          Continue with Google
        </button>

        {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}
      </section>
    </main>
  );
}
