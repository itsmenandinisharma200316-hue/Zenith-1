"use client";

import { animate, useMotionValue, useTransform, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

/** Counts up to `value` without re-rendering React on every frame. */
export function Counter({
  value,
  duration = 1.1,
  format = (n: number) => Math.round(n).toLocaleString(),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => format(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, duration, mv, reduce]);

  return <motion.span className={className}>{text}</motion.span>;
}
