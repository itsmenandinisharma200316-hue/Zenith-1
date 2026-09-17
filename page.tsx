"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { ShareComposer } from "@/components/ShareComposer";
import { Button, Pill } from "@/components/ui";
import { SESSIONS, sessionById } from "@/lib/data";
import { micro, pop, ui } from "@/lib/motion";
import { useActions, useStore } from "@/lib/store";

type Phase = "inhale" | "hold" | "exhale" | "rest";
const LABEL: Record<Phase, string> = { inhale: "Breathe in", hold: "Hold", exhale: "Breathe out", rest: "Rest" };

export default function SessionPlayer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { state } = useStore();
  const { complete } = useActions();

  const session = useMemo(() => sessionById(id) ?? SESSIONS[0], [id]);
  const total = session.minutes * 60;

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [phaseLeft, setPhaseLeft] = useState(session.pattern[0]);
  const [finished, setFinished] = useState(false);
  const [sharing, setSharing] = useState(false);
  const savedRef = useRef(false);

  /* Phase schedule derived from the session's pattern, skipping zero-length phases. */
  const schedule = useMemo(() => {
    const [inh, hold, exh, rest] = session.pattern;
    return ([
      ["inhale", inh],
      ["hold", hold],
      ["exhale", exh],
      ["rest", rest],
    ] as [Phase, number][]).filter(([, d]) => d > 0);
  }, [session.pattern]);

  const finish = useCallback(() => {
    setRunning(false);
    setFinished(true);
    if (savedRef.current) return;
    savedRef.current = true;
    complete({
      id: `a-${Date.now()}`,
      sessionId: session.id,
      title: session.title,
      kind: session.kind,
      minutes: session.minutes,
      xp: session.xp,
      at: new Date().toISOString(),
      streakAtTime: state.streak,
    });
  }, [complete, session, state.streak]);

  /* One clock drives both the total timer and the phase cycle. */
  useEffect(() => {
    if (!running) return;
    let idx = schedule.findIndex(([p]) => p === phase);
    if (idx < 0) idx = 0;
    let left = phaseLeft;

    const t = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= total) {
          window.clearInterval(t);
          finish();
          return total;
        }
        return next;
      });

      left -= 1;
      if (left <= 0) {
        idx = (idx + 1) % schedule.length;
        left = schedule[idx][1];
        setPhase(schedule[idx][0]);
      }
      setPhaseLeft(left);
    }, 1000);

    return () => window.clearInterval(t);
    // Restarting the interval on every phase tick would drift; we intentionally
    // key only on `running` and re-derive position from state when it flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, schedule, total, finish]);

  const pct = total ? elapsed / total : 0;
  const mm = Math.floor((total - elapsed) / 60);
  const ss = (total - elapsed) % 60;

  /* The orb scale follows the phase — the animation IS the instruction. */
  const orbTarget = phase === "inhale" ? 1 : phase === "hold" ? 1 : phase === "exhale" ? 0.62 : 0.62;
  const phaseDur = schedule.find(([p]) => p === phase)?.[1] ?? 4;

  if (finished) {
    return (
      <Complete
        session={session}
        streak={state.streak}
        onShare={() => setSharing(true)}
        sharing={sharing}
        onCloseShare={() => setSharing(false)}
        handle={state.profile.handle || "you"}
        name={state.profile.name || "You"}
      />
    );
  }

  return (
    <main
      className="relative flex min-h-dvh flex-col overflow-hidden px-5"
      style={{ paddingTop: "calc(var(--safe-t) + 14px)", paddingBottom: "calc(var(--safe-b) + 26px)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(70% 50% at 50% 38%, ${session.gradient[0]}55, transparent 72%)` }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <button
          onClick={() => router.back()}
          aria-label="Leave session"
          className="grid h-11 w-11 place-items-center rounded-2xl border border-hairline bg-surface-2 text-ink"
        >
          <Icon name="arrow-left" size={20} />
        </button>
        <div className="text-center">
          <p className="eyebrow text-ink-3">{session.kind}</p>
          <p className="text-[15px] font-extrabold">{session.title}</p>
        </div>
        <Pill tint="amber">
          <Icon name="star" size={12} strokeWidth={2.4} />+{session.xp}
        </Pill>
      </div>

      {/* Orb */}
      <div className="relative grid flex-1 place-items-center">
        <div className="relative grid h-[290px] w-[290px] place-items-center">
          {/* Progress ring */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.6" />
            <motion.circle
              cx="50" cy="50" r="47" fill="none"
              stroke="var(--color-mint)" strokeWidth="1.8" strokeLinecap="round"
              pathLength={1}
              style={{ strokeDasharray: 1 }}
              animate={{ strokeDashoffset: 1 - pct }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </svg>

          {/* Halo */}
          <motion.div
            className="absolute h-[230px] w-[230px] rounded-full"
            style={{ background: `radial-gradient(circle, ${session.gradient[1]}44, transparent 70%)` }}
            animate={reduce || !running ? { scale: 1 } : { scale: orbTarget * 1.15 }}
            transition={{ duration: phaseDur, ease: "easeInOut" }}
          />

          {/* Core */}
          <motion.div
            className="relative grid h-[190px] w-[190px] place-items-center rounded-full"
            style={{ background: `linear-gradient(150deg, ${session.gradient[0]}, ${session.gradient[1]})` }}
            animate={reduce || !running ? { scale: 0.85 } : { scale: orbTarget }}
            transition={{ duration: phaseDur, ease: "easeInOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={running ? phase : "idle"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={micro}
                className="text-center"
              >
                <p className="text-[19px] font-extrabold tracking-[-0.02em]">
                  {running ? LABEL[phase] : "Ready"}
                </p>
                {running && <p className="tnum mt-0.5 text-[13px] text-white/70">{phaseLeft}</p>}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <p className="tnum absolute bottom-2 text-[15px] font-bold text-ink-2">
          {mm}:{String(ss).padStart(2, "0")} left
        </p>
      </div>

      {/* Controls */}
      <div className="relative space-y-2">
        <p className="mb-4 text-center text-[14px] leading-relaxed text-ink-2">{session.subtitle}</p>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setRunning((v) => !v)}
            whileTap={{ scale: 0.97 }}
            transition={micro}
            className="flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-mint text-[16px] font-extrabold text-[#04231E]"
          >
            <Icon name={running ? "pause" : "play"} size={19} strokeWidth={2.3} />
            {running ? "Pause" : elapsed ? "Resume" : "Begin"}
          </motion.button>
          <motion.button
            onClick={finish}
            whileTap={{ scale: 0.97 }}
            transition={micro}
            className="grid min-h-[56px] w-16 place-items-center rounded-2xl border border-hairline bg-surface-2 text-ink-2"
            aria-label="Finish early"
          >
            <Icon name="check" size={20} />
          </motion.button>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────── completion ───────────────────────── */

function Complete({
  session,
  streak,
  onShare,
  sharing,
  onCloseShare,
  handle,
  name,
}: {
  session: (typeof SESSIONS)[number];
  streak: number;
  onShare: () => void;
  sharing: boolean;
  onCloseShare: () => void;
  handle: string;
  name: string;
}) {
  return (
    <>
      <main
        className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 text-center"
        style={{ paddingTop: "calc(var(--safe-t) + 20px)", paddingBottom: "calc(var(--safe-b) + 26px)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(60% 40% at 50% 30%, ${session.gradient[1]}44, transparent 70%)` }}
        />

        <motion.div
          className="relative grid h-24 w-24 place-items-center rounded-full bg-mint text-[#04231E]"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={pop}
        >
          <Icon name="check" size={44} strokeWidth={2.6} />
        </motion.div>

        <motion.h1
          className="display relative mt-7 text-[34px]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ui, delay: 0.12 }}
        >
          That&apos;s {session.minutes} minutes
          <br />
          you gave yourself.
        </motion.h1>

        <motion.div
          className="relative mt-6 flex gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ui, delay: 0.2 }}
        >
          <Pill tint="amber">
            <Icon name="star" size={13} strokeWidth={2.3} /> +{session.xp} XP
          </Pill>
          <Pill tint="mint">
            <Icon name="flame" size={13} strokeWidth={2.3} /> {streak} day streak
          </Pill>
        </motion.div>

        <motion.div
          className="relative mt-10 w-full space-y-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ui, delay: 0.3 }}
        >
          <Button onClick={onShare} icon="share">
            Share your card
          </Button>
          <Link href="/home" className="grid min-h-[52px] place-items-center text-[15px] font-bold text-ink-2">
            Not now
          </Link>
        </motion.div>
      </main>

      <ShareComposer
        open={sharing}
        onClose={onCloseShare}
        data={{
          title: session.title,
          minutes: session.minutes,
          xp: session.xp,
          streak,
          handle,
          name,
          dateLabel: "Today",
          pattern: session.pattern,
        }}
      />
    </>
  );
}
