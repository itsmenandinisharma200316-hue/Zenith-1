"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { Wordmark, Logo } from "@/components/Icon";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Welcome() {
  const { state, ready } = useStore();
  const router = useRouter();
  const reduce = useReducedMotion();

  // Returning users skip straight past the pitch.
  useEffect(() => {
    if (ready && state.profile.onboarded) router.replace("/home");
  }, [ready, state.profile.onboarded, router]);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-5"
      style={{ paddingTop: "calc(var(--safe-t) + 8px)", paddingBottom: "calc(var(--safe-b) + 28px)" }}
    >
      {/* Ambient field */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, #2A2568 0%, rgba(42,37,104,0) 68%)" }} />
        <div className="absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, #123A52 0%, rgba(18,58,82,0) 70%)" }} />
      </div>

      {/* Orbit hero */}
      <div className="relative grid flex-1 place-items-center">
        <motion.div
          className="relative h-[240px] w-[240px]"
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Two orbit rings, counter-rotating */}
          <motion.div
            className="absolute inset-0 rounded-[50%] border border-white/12"
            style={{ transform: "rotate(-24deg)" }}
            animate={reduce ? undefined : { rotate: [-24, 336] }}
            transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[26px] rounded-[50%] border border-white/10"
            style={{ transform: "rotate(30deg)" }}
            animate={reduce ? undefined : { rotate: [30, -330] }}
            transition={{ duration: 62, repeat: Infinity, ease: "linear" }}
          />

          {/* Breathing core */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 30%, #4A3FB0, #2A2568 72%)" }}
            animate={reduce ? undefined : { scale: [1, 1.07, 1], opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* The body on the path */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-0 w-0"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            <motion.span
              className="absolute block h-4 w-4 rounded-full bg-amber"
              style={{ top: -108, left: -8, boxShadow: "0 0 26px 6px rgba(247,184,75,0.45)" }}
              animate={reduce ? undefined : { scale: [1, 1.18, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Pitch */}
      <motion.div
        className="relative"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { delayChildren: 0.22, staggerChildren: 0.08 } } }}
      >
        {[
          <div key="mark" className="mb-7 flex items-center gap-3">
            <Logo size={38} />
            <Wordmark className="text-[15px]" />
          </div>,
          <h1 key="h" className="display mb-3 text-[48px]">
            Level Up
            <br />
            Your Mind.
          </h1>,
          <p key="p" className="mb-8 text-[17px] leading-relaxed text-[#9F9BD4]">
            Mindfulness that fits the way you live.
          </p>,
          <div key="cta" className="space-y-1">
            <Button onClick={() => router.push("/onboarding")} icon="arrow-right">
              Get started
            </Button>
            <Link
              href="/home"
              onClick={() => localStorage.setItem("zenith.skip", "1")}
              className="grid min-h-[52px] place-items-center text-[15px] font-bold text-violet"
            >
              I already have an account
            </Link>
          </div>,
          <p key="tag" className="eyebrow mt-4 text-center text-[10px] text-ink-3">
            Playful on the surface. Mindful at the core.
          </p>,
        ].map((node, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {node}
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}
