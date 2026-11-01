"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark } from "@/components/Icon";
import { Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    if (!supabase) {
      setError("Sign-in is not configured yet. Please try again shortly.");
      return;
    }
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col justify-between overflow-hidden px-5"
      style={{ paddingTop: "calc(var(--safe-t) + 28px)", paddingBottom: "calc(var(--safe-b) + 28px)" }}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, #2A2568 0%, rgba(42,37,104,0) 68%)" }} />
      </div>
      <div className="relative">
        <div className="mb-10 flex items-center gap-3"><Logo size={38} /><Wordmark className="text-[15px]" /></div>
        <p className="eyebrow mb-3 text-mint">Your space, your pace</p>
        <h1 className="display mb-3 text-[38px]">Welcome to<br />your next chapter.</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-ink-2">Sign in to keep your sessions, check-ins and progress together across devices.</p>
        <Button onClick={signInWithGoogle} disabled={loading} icon="arrow-right">
          {loading ? "Connecting to Google…" : "Continue with Google"}
        </Button>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <button onClick={() => router.push("/")} className="mt-4 grid min-h-[48px] w-full place-items-center text-[14px] font-bold text-ink-2">
          Back
        </button>
      </div>
      <p className="relative text-center text-[11px] leading-relaxed text-ink-3">By continuing, you agree to use Zenith responsibly. Your wellness data is private to your account.</p>
    </main>
  );
}
