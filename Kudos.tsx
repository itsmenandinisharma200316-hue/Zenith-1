"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Icon } from "./Icon";
import { micro } from "@/lib/motion";

/**
 * Strava's kudos, in Zenith's language: a spark, not a thumbs-up. Tapping fires a
 * one-shot particle burst — the reward has to feel worth giving.
 */
export function Kudos({ count, on, onToggle }: { count: number; on: boolean; onToggle: () => void }) {
  const [burst, setBurst] = useState(0);

  return (
    <motion.button
      onClick={() => {
        if (!on) setBurst((b) => b + 1);
        onToggle();
      }}
      whileTap={{ scale: 0.9 }}
      transition={micro}
      aria-pressed={on}
      aria-label={on ? `Remove your spark. ${count} sparks` : `Give a spark. ${count} sparks`}
      className={`relative flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-extrabold ${
        on ? "border-amber/50 bg-amber/14 text-amber" : "border-hairline bg-surface-2 text-ink-2"
      }`}
    >
      <motion.span
        animate={on ? { scale: [1, 1.35, 1], rotate: [0, -12, 0] } : { scale: 1 }}
        transition={on ? { duration: 0.42, ease: [0.34, 1.56, 0.64, 1], times: [0, 0.45, 1] } : micro}
      >
        <Icon name="spark" size={16} strokeWidth={on ? 2.2 : 1.8} />
      </motion.span>
      <span className="tnum">{count}</span>

      {/* Particles */}
      <AnimatePresence>
        {burst > 0 && (
          <motion.span
            key={burst}
            className="pointer-events-none absolute left-[18px] top-1/2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
          >
            {Array.from({ length: 7 }).map((_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return (
                <motion.span
                  key={i}
                  className="absolute block h-1.5 w-1.5 rounded-full bg-amber"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(a) * 26,
                    y: Math.sin(a) * 26,
                    opacity: 0,
                    scale: 0.3,
                  }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
