"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { listItem, listParent, micro, screen, tap, ui } from "@/lib/motion";

/* ── Screen shell ───────────────────────────────────────── */

export function Screen({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <motion.main
      variants={screen}
      initial="hidden"
      animate="show"
      className={`relative min-h-dvh ${pad ? "px-5" : ""} ${className}`}
      style={{ paddingBottom: pad ? "calc(var(--tabbar) + 28px)" : undefined }}
    >
      {children}
    </motion.main>
  );
}

export function TopBar({
  title,
  left,
  right,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-5 px-5 pb-3 backdrop-blur-xl"
      style={{
        paddingTop: "calc(var(--safe-t) + 18px)",
        background: "linear-gradient(to bottom, rgba(10,15,31,0.94) 60%, rgba(10,15,31,0))",
      }}
    >
      <div className="flex min-h-[44px] items-center gap-3">
        <div className="flex w-11 shrink-0 justify-start">{left}</div>
        <div className="min-w-0 flex-1 text-center">
          {title && <h1 className="truncate text-[19px] font-extrabold tracking-[-0.02em]">{title}</h1>}
        </div>
        <div className="flex w-11 shrink-0 justify-end">{right}</div>
      </div>
      {subtitle && <p className="mt-1 text-[14px] text-ink-2">{subtitle}</p>}
    </header>
  );
}

/** 44x44 icon button — meets the touch-target floor even when the glyph is small. */
export function IconButton({
  name,
  label,
  onClick,
  variant = "ghost",
}: {
  name: IconName;
  label: string;
  onClick?: () => void;
  variant?: "ghost" | "solid";
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={tap}
      transition={micro}
      aria-label={label}
      className={`grid h-11 w-11 place-items-center rounded-2xl ${
        variant === "solid"
          ? "bg-surface-2 border border-hairline text-ink"
          : "text-ink-2 hover:text-ink"
      }`}
    >
      <Icon name={name} size={20} />
    </motion.button>
  );
}

export function BackButton({ fallback = "/home" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <IconButton
      name="arrow-left"
      label="Go back"
      variant="solid"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
    />
  );
}

/* ── Content primitives ─────────────────────────────────── */

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5 text-mint">{eyebrow}</p>}
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  ...rest
}: HTMLMotionProps<"div"> & { className?: string }) {
  return (
    <motion.div className={`card p-4 ${className}`} {...rest}>
      {children}
    </motion.div>
  );
}

/** Staggered list container — children use <Stagger.Item>. */
export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={listParent} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

Stagger.Item = function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={listItem} className={className}>
      {children}
    </motion.div>
  );
};

/* ── Progress ───────────────────────────────────────────── */

export function Bar({
  value,
  tint = "mint",
  height = 6,
  delay = 0,
}: {
  value: number;
  tint?: "mint" | "amber" | "violet";
  height?: number;
  delay?: number;
}) {
  const bg = { mint: "var(--color-mint)", amber: "var(--color-amber)", violet: "var(--color-violet)" }[tint];
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-white/10"
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: bg, transformOrigin: "left" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0.02, Math.min(1, value)) }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </div>
  );
}

export function Pill({
  children,
  tint = "surface",
  className = "",
}: {
  children: ReactNode;
  tint?: "surface" | "mint" | "amber" | "violet";
  className?: string;
}) {
  const map = {
    surface: "bg-white/8 text-ink-2",
    mint: "bg-mint/15 text-mint",
    amber: "bg-amber/15 text-amber",
    violet: "bg-violet/20 text-violet",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ${map[tint]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ── Buttons ────────────────────────────────────────────── */

export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  full = true,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "surface";
  icon?: IconName;
  full?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles = {
    primary: "bg-mint text-[#04231E] shadow-[0_10px_30px_-10px_rgba(47,227,195,0.7)]",
    surface: "bg-surface-2 text-ink border border-hairline",
    ghost: "text-ink-2",
  }[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : tap}
      transition={micro}
      className={`inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl px-6 text-[16px] font-extrabold tracking-[-0.01em] disabled:opacity-40 ${styles} ${
        full ? "w-full" : ""
      }`}
    >
      {children}
      {icon && <Icon name={icon} size={19} strokeWidth={2.2} />}
    </motion.button>
  );
}

/* ── Avatar ─────────────────────────────────────────────── */

export function Avatar({
  initials,
  hue = 262,
  size = 40,
  ring = false,
  dimRing = false,
}: {
  initials: string;
  hue?: number;
  size?: number;
  ring?: boolean;
  dimRing?: boolean;
}) {
  const inner = (
    <div
      className="grid place-items-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(145deg, hsl(${hue} 62% 52%), hsl(${hue + 28} 58% 38%))`,
      }}
    >
      {initials}
    </div>
  );

  if (!ring) return inner;

  return (
    <div
      className="grid place-items-center rounded-full p-[2.5px]"
      style={{
        background: dimRing
          ? "var(--color-surface-3)"
          : "conic-gradient(from 210deg, var(--color-mint), var(--color-violet), var(--color-amber), var(--color-mint))",
      }}
    >
      <div className="rounded-full bg-abyss p-[2px]">{inner}</div>
    </div>
  );
}

/* ── Segmented control ──────────────────────────────────── */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  layoutId,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon?: IconName }[];
  layoutId: string;
}) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto no-bar">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`relative flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl px-3 text-[13px] font-bold transition-colors ${
              active ? "text-mint" : "text-ink-3"
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-mint/12"
                transition={ui}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.icon && <Icon name={o.icon} size={16} />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Empty({ title, body, icon = "spark" }: { title: string; body: string; icon?: IconName }) {
  return (
    <div className="card grid place-items-center gap-2 px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint/12 text-mint">
        <Icon name={icon} size={22} />
      </div>
      <p className="text-[16px] font-extrabold">{title}</p>
      <p className="max-w-[26ch] text-[14px] leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
