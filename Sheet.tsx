"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { exit, sheet } from "@/lib/motion";

/**
 * Bottom sheet. Drag-to-dismiss with a velocity threshold, scroll locked behind
 * it, Escape closes, and focus is trapped by `inert` on the page behind.
 */
export function Sheet({
  open,
  onClose,
  children,
  label,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 mx-auto flex max-w-[460px] items-end">
          <motion.button
            key="scrim"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: exit }}
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            variants={sheet}
            initial="hidden"
            animate="show"
            exit="out"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) onClose();
            }}
            className="relative w-full rounded-t-[28px] border-t border-hairline bg-surface
                       shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.9)]"
            style={{ paddingBottom: "calc(var(--safe-b) + 20px)" }}
          >
            <div className="grid place-items-center py-3">
              <span className="h-1.5 w-11 rounded-full bg-white/22" />
            </div>
            <div className="max-h-[78dvh] overflow-y-auto overscroll-contain px-5 pb-2">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
