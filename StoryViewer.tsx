"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Avatar } from "./ui";
import { micro, ui } from "@/lib/motion";
import { drawCard, type CardData, type ThemeId } from "@/lib/share-card";

export interface Story {
  id: string;
  name: string;
  handle: string;
  initials: string;
  hue: number;
  theme: ThemeId;
  card: Omit<CardData, "showStats">;
  timeLabel: string;
}

const DURATION = 6000;

/**
 * Snapchat/Instagram-style story viewer. Each story is the friend's own share
 * card, drawn with the same renderer the composer uses — so what you post is
 * exactly what your circle sees.
 */
export function StoryViewer({
  stories,
  startIndex,
  onClose,
  onSeen,
}: {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onSeen: (id: string) => void;
}) {
  const [i, setI] = useState(startIndex);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number | null>(null);
  const started = useRef<number>(0);
  const elapsed = useRef<number>(0);

  const story = stories[i];

  const next = useCallback(() => {
    setI((v) => {
      if (v + 1 >= stories.length) {
        onClose();
        return v;
      }
      return v + 1;
    });
  }, [stories.length, onClose]);

  const prev = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  /* Draw the current card */
  useEffect(() => {
    if (!story) return;
    const c = canvasRef.current;
    if (!c) return;
    const paint = () => drawCard(c, "story", story.theme, { ...story.card, showStats: true });
    document.fonts?.ready.then(paint).catch(paint);
    paint();
    onSeen(story.id);
  }, [story, onSeen]);

  /* Progress clock — pauses while the finger is down */
  useEffect(() => {
    elapsed.current = 0;
    setProgress(0);
  }, [i]);

  useEffect(() => {
    if (paused) return;
    started.current = performance.now() - elapsed.current;
    const tick = (now: number) => {
      elapsed.current = now - started.current;
      const p = Math.min(1, elapsed.current / DURATION);
      setProgress(p);
      if (p >= 1) {
        next();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [paused, i, next]);

  /* Keyboard for desktop */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, next, prev]);

  if (!story) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[70] mx-auto flex max-w-[460px] flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={ui}
      role="dialog"
      aria-modal="true"
      aria-label={`${story.name}'s story`}
    >
      {/* Segmented progress */}
      <div className="absolute inset-x-0 z-20 flex gap-1 px-3" style={{ top: "calc(var(--safe-t) + 10px)" }}>
        {stories.map((s, idx) => (
          <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{
                transform: `scaleX(${idx < i ? 1 : idx === i ? progress : 0})`,
                transformOrigin: "left",
              }}
            />
          </div>
        ))}
      </div>

      {/* Author */}
      <div
        className="absolute inset-x-0 z-20 flex items-center gap-3 px-4"
        style={{ top: "calc(var(--safe-t) + 26px)" }}
      >
        <Avatar initials={story.initials} hue={story.hue} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-extrabold">{story.name}</p>
          <p className="text-[11.5px] text-white/60">{story.timeLabel}</p>
        </div>
        <button onClick={onClose} aria-label="Close stories" className="grid h-11 w-11 place-items-center text-white/80">
          <Icon name="x" size={22} />
        </button>
      </div>

      {/* The card */}
      <div className="grid flex-1 place-items-center px-3">
        <AnimatePresence mode="wait">
          <motion.canvas
            key={story.id}
            ref={canvasRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={micro}
            className="max-h-full w-full rounded-2xl"
            style={{ aspectRatio: "9 / 16" }}
          />
        </AnimatePresence>
      </div>

      {/* Tap zones: left third goes back, the rest goes forward; hold pauses. */}
      <div className="absolute inset-0 z-10 flex" style={{ top: "calc(var(--safe-t) + 70px)" }}>
        <button
          className="w-1/3"
          aria-label="Previous story"
          onClick={prev}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        />
        <button
          className="flex-1"
          aria-label="Next story"
          onClick={next}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        />
      </div>
    </motion.div>
  );
}
