"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { micro, tap, ui } from "@/lib/motion";
import {
  drawCard,
  shareCard,
  templateById,
  TEMPLATES,
  THEMES,
  type CardData,
  type TemplateId,
  type ThemeId,
} from "@/lib/share-card";

/**
 * Full-screen composer. The preview is the real 1080px canvas scaled down with
 * CSS, so what you see is byte-for-byte what gets shared.
 */
export function ShareComposer({
  open,
  onClose,
  data,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  data: Omit<CardData, "showStats">;
  onShared?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<TemplateId>(data.milestone ? "badge" : "story");
  const [theme, setTheme] = useState<ThemeId>("aurora");
  const [showStats, setShowStats] = useState(true);
  const [note, setNote] = useState(data.note ?? "");
  const [editingNote, setEditingNote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const render = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawCard(c, template, theme, { ...data, note: note.trim() || undefined, showStats });
  }, [template, theme, data, note, showStats]);

  // Fonts must be resolved before the first paint or the card renders in Times.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    document.fonts?.ready.then(() => alive && render()).catch(() => render());
    render();
    return () => {
      alive = false;
    };
  }, [open, render]);

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

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const onShare = async () => {
    const c = canvasRef.current;
    if (!c || busy) return;
    setBusy(true);
    const result = await shareCard(
      c,
      `zenith-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`,
      `${data.minutes} minutes of ${data.title} on Zenith.`,
    );
    setBusy(false);
    if (result === "shared") {
      onShared?.();
      onClose();
    } else if (result === "downloaded") {
      flash("Saved to your downloads");
      onShared?.();
    } else if (result === "failed") {
      flash("Could not create the image");
    }
  };

  const tpl = templateById(template);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] mx-auto flex max-w-[460px] flex-col bg-void"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: ui }}
          exit={{ opacity: 0, y: 16, transition: { duration: 0.18 } }}
          role="dialog"
          aria-modal="true"
          aria-label="Share your session"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 pb-2"
            style={{ paddingTop: "calc(var(--safe-t) + 14px)" }}
          >
            <button onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-2xl text-ink-2">
              <Icon name="x" size={21} />
            </button>
            <p className="text-[16px] font-extrabold">Share</p>
            <button
              onClick={() => setShowStats((v) => !v)}
              aria-pressed={showStats}
              className={`grid h-11 w-11 place-items-center rounded-2xl ${showStats ? "text-mint" : "text-ink-3"}`}
              aria-label={showStats ? "Hide stats on the card" : "Show stats on the card"}
            >
              <Icon name="bars" size={20} />
            </button>
          </div>

          {/* Preview */}
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-2">
            <motion.div
              key={template}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={ui}
              className="relative"
              style={{ aspectRatio: `${tpl.w} / ${tpl.h}`, maxHeight: "100%", maxWidth: "100%" }}
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full rounded-[22px] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.95)]"
                style={{ display: "block", aspectRatio: `${tpl.w} / ${tpl.h}` }}
                aria-label={`Share card preview: ${data.title}`}
                role="img"
              />
            </motion.div>
          </div>

          {/* Controls */}
          <div
            className="space-y-3 border-t border-hairline bg-surface/60 px-4 pt-3 backdrop-blur-xl"
            style={{ paddingBottom: "calc(var(--safe-b) + 14px)" }}
          >
            {/* Template */}
            <div className="flex gap-2">
              {TEMPLATES.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  whileTap={tap}
                  transition={micro}
                  aria-pressed={template === t.id}
                  className={`flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-xl border text-[12px] font-extrabold ${
                    template === t.id ? "border-mint/60 bg-mint/12 text-mint" : "border-hairline bg-surface-2 text-ink-2"
                  }`}
                >
                  {t.label}
                  <span className="text-[10px] font-bold opacity-60">{t.ratio}</span>
                </motion.button>
              ))}
            </div>

            {/* Theme + note */}
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    whileTap={{ scale: 0.88 }}
                    transition={micro}
                    aria-pressed={theme === t.id}
                    aria-label={`${t.label} theme`}
                    className="relative grid h-11 w-11 place-items-center rounded-full"
                  >
                    <span
                      className="h-8 w-8 rounded-full"
                      style={{ background: `linear-gradient(140deg, ${t.bg[0]}, ${t.accent})` }}
                    />
                    {theme === t.id && (
                      <motion.span
                        layoutId="theme-ring"
                        transition={ui}
                        className="absolute inset-0 rounded-full border-2 border-mint"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => setEditingNote((v) => !v)}
                whileTap={tap}
                transition={micro}
                className={`ml-auto flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 text-[13px] font-bold ${
                  note ? "border-mint/50 bg-mint/10 text-mint" : "border-hairline bg-surface-2 text-ink-2"
                }`}
              >
                <Icon name="spark" size={16} />
                {note ? "Edit note" : "Add note"}
              </motion.button>
            </div>

            <AnimatePresence initial={false}>
              {editingNote && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={ui}
                  className="overflow-hidden"
                >
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 120))}
                    placeholder="Say something about this one…"
                    rows={2}
                    autoFocus
                    className="w-full resize-none rounded-xl border border-hairline bg-surface-2 px-3.5 py-3 text-[15px]
                               placeholder:text-ink-3 focus:border-mint/60 focus:outline-none"
                  />
                  <p className="tnum mt-1 text-right text-[11px] text-ink-3">{note.length}/120</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                onClick={onShare}
                disabled={busy}
                whileTap={tap}
                transition={micro}
                className="flex min-h-[54px] flex-1 items-center justify-center gap-2 rounded-2xl bg-mint text-[16px]
                           font-extrabold text-[#04231E] disabled:opacity-50"
              >
                <Icon name="share" size={19} strokeWidth={2.2} />
                {busy ? "Preparing…" : "Share"}
              </motion.button>
              <motion.button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${data.name} just finished ${data.minutes} min of ${data.title} on Zenith.`,
                    );
                    flash("Copied");
                  } catch {
                    flash("Clipboard unavailable");
                  }
                }}
                whileTap={tap}
                transition={micro}
                aria-label="Copy caption"
                className="grid min-h-[54px] w-14 place-items-center rounded-2xl border border-hairline bg-surface-2 text-ink-2"
              >
                <Icon name="copy" size={19} />
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={ui}
                role="status"
                className="pointer-events-none absolute bottom-[190px] left-1/2 -translate-x-1/2 rounded-full
                           bg-surface-3 px-4 py-2 text-[13px] font-bold shadow-lg"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
