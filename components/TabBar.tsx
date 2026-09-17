"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Icon, type IconName } from "./Icon";
import { micro, ui } from "@/lib/motion";

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "compass" },
  { href: "/circles", label: "Circles", icon: "users" },
  { href: "/progress", label: "Progress", icon: "bars" },
  { href: "/profile", label: "Profile", icon: "user" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-[460px] justify-center px-4"
      style={{ paddingBottom: "calc(var(--safe-b) + 10px)" }}
    >
      <div
        className="pointer-events-auto flex w-full items-stretch justify-between rounded-[26px] border border-hairline px-1.5
                   bg-[rgba(16,22,42,0.82)] backdrop-blur-2xl shadow-[0_18px_44px_-14px_rgba(0,0,0,0.9)]"
      >
        {TABS.map((t) => {
          const active = pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className="relative flex min-h-[58px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px]"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  transition={ui}
                  className="absolute inset-x-1 inset-y-[5px] rounded-[18px] bg-mint/10"
                />
              )}
              <motion.span
                className="relative"
                animate={{
                  color: active ? "var(--color-mint)" : "var(--color-ink-3)",
                  y: active ? -1 : 0,
                }}
                transition={micro}
              >
                <Icon name={t.icon} size={21} strokeWidth={active ? 2.1 : 1.7} />
              </motion.span>
              <span
                className="relative text-[10.5px] font-bold tracking-[0.01em] transition-colors"
                style={{ color: active ? "var(--color-mint)" : "var(--color-ink-3)" }}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
