"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing your sign-in…");

  useEffect(() => {
    if (!supabase) {
      setMessage("Sign-in is not configured. Please return and try again.");
      return;
    }

    let finished = false;
    const params = new URLSearchParams(window.location.search);
    const oauthError =
      params.get("error_description") || params.get("error");

    if (oauthError) {
      setMessage(decodeURIComponent(oauthError.replace(/\+/g, " ")));
      return;
    }

    const goToApp = () => {
      if (finished) return;
      finished = true;
      router.replace("/onboarding");
    };

    // The Supabase browser client automatically processes the OAuth callback
    // because detectSessionInUrl is enabled. Avoid exchanging the same code twice.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
          goToApp();
        }
      },
    );

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (finished) return;
      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        goToApp();
      } else {
        setMessage(
          "Supabase returned to Zenith without an active session. Please check the Supabase Google provider and callback URL, then try again.",
        );
      }
    };

    void checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-center">
      <div className="max-w-xs">
        <p className="display mb-3 text-[28px]">Zenith</p>
        <p className="text-sm leading-relaxed text-ink-2">{message}</p>
        <button
          onClick={() => router.replace("/login")}
          className="mt-6 text-sm font-bold text-mint"
        >
          Back to sign in
        </button>
      </div>
    </main>
  );
}
