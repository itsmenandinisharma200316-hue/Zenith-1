"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing your sign-in…");

  useEffect(() => {
    let active = true;
    const finish = async () => {
      if (!supabase) {
        setMessage("Sign-in is not configured. Please return and try again.");
        return;
      }
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (active) setMessage(error.message);
          return;
        }
      }
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        if (active) setMessage(error?.message ?? "We couldn't confirm your session. Please try signing in again.");
        return;
      }
      router.replace("/home");
    };
    void finish();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-center">
      <div className="max-w-xs">
        <p className="display mb-3 text-[28px]">Zenith</p>
        <p className="text-sm leading-relaxed text-ink-2">{message}</p>
        <button onClick={() => router.replace("/login")} className="mt-6 text-sm font-bold text-mint">Back to sign in</button>
      </div>
    </main>
  );
}
