import type { Transition, Variants } from "motion/react";
import { stagger } from "motion/react";

/**
 * One motion vocabulary for the whole app. Durations follow the frequency rule:
 * the more often a thing animates, the shorter and quieter it is.
 */

/** Taps, toggles, chips — 1000x/day, so barely there. */
export const micro: Transition = { duration: 0.14, ease: [0.2, 0, 0, 1] };

/** Cards, sheets, tab content — the workhorse. */
export const ui: Transition = { duration: 0.26, ease: [0.16, 1, 0.3, 1] };

/** Route changes — long enough to read as a spatial move. */
export const route: Transition = { duration: 0.36, ease: [0.16, 1, 0.3, 1] };

/** Physical things the finger moved: sheets, cards being flung. */
export const springy: Transition = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 };

/** Celebratory — level-ups, badge reveals. Overshoot is the point. */
export const pop: Transition = { type: "spring", stiffness: 300, damping: 16, mass: 0.7 };

/** Exit is always quieter than enter: opacity-led, faster, ease-in. */
export const exit: Transition = { duration: 0.16, ease: [0.42, 0, 1, 1] };

/* ── Reusable variants ───────────────────────────────────── */

/** Parent of a list. Children reveal in sequence without their own initial/animate. */
export const listParent: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { delayChildren: stagger(0.055, { startDelay: 0.04 }) } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: ui },
  out: { opacity: 0, y: -6, transition: exit },
};

/** Screen-level enter/exit for route transitions. */
export const screen: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: route },
  out: { opacity: 0, y: -6, transition: exit },
};

/** Bottom sheet. */
export const sheet: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: springy },
  out: { y: "100%", transition: { duration: 0.22, ease: [0.42, 0, 1, 1] } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: ui },
  out: { opacity: 0, transition: exit },
};

/** Standard press feedback for any motion tappable. */
export const tap = { scale: 0.97 } as const;
