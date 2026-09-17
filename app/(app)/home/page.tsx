"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Counter } from "@/components/Counter";
import { Avatar, Bar, Card, Pill, Screen, SectionTitle, Stagger } from "@/components/ui";
import { CHALLENGES, levelFor, SESSIONS, sessionById } from "@/lib/data";
import { micro, pop, tap, ui } from "@/lib/motion";
import { useActions, useStore } from "@/lib/store";

const MOOD_WORDS = ["Rough", "Low", "Okay", "Good", "Great"];

export default function Home() {
  const { state, ready, today } = useStore();
  const { toggleTask, checkIn } = useActions();
  const [checkOpen, setCheckOpen] = useState(false);

  const { level, into, need, toNext, pct } = levelFor(state.xp);
  const done = state.tasks.filter((t) => t.done).length;

  // Pick today's quest from the goals chosen at onboarding.
  const quest = useMemo(() => {
    const preferred = SESSIONS.filter((s) => state.profile.goals.includes(s.goal));
    return (preferred[0] ?? sessionById("reset-your-mind")) ?? SESSIONS[0];
  }, [state.profile.goals]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  }, []);

  const name = state.profile.name || "friend";
  const mood = today?.mood ?? 3.6;

  return (
    <Screen>
      {/* Greeting */}
      <div className="flex items-start justify-between gap-3 pb-6" style={{ paddingTop: "calc(var(--safe-t) + 24px)" }}>
        <div className="min-w-0">
          <motion.h1
            className="display truncate text-[26px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ui}
          >
            {greeting}, <span className="capitalize">{name}</span>
          </motion.h1>
          <motion.p
            className="mt-1 text-[14px] text-ink-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...ui, delay: 0.06 }}
          >
            A little space for you, today.
          </motion.p>
        </div>
        <Link href="/profile" aria-label="Your profile" className="relative shrink-0">
          <Avatar initials={name[0]?.toUpperCase() ?? "Z"} hue={262} size={42} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-abyss bg-mint" />
        </Link>
      </div>

      <Stagger className="space-y-4">
        {/* ── Level card ────────────────────────────────── */}
        <Stagger.Item>
          <div className="relative overflow-hidden rounded-[22px] border border-violet/25 p-5"
            style={{ background: "linear-gradient(152deg, #2E2A6B 0%, #241F58 58%, #1D1947 100%)" }}
          >
            <div className="aurora opacity-50" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow mb-2 text-[#B9B2F2]">Current level</p>
                  <p className="display tnum text-[46px] leading-none">{String(level).padStart(2, "0")}</p>
                </div>
                <Pill tint="amber" className="bg-black/25 text-amber">
                  <Icon name="star" size={13} strokeWidth={2.4} />
                  <Counter value={state.xp} className="tnum" /> XP
                </Pill>
              </div>

              <div className="mt-5 mb-2 flex items-baseline justify-between text-[13px] font-bold">
                <span className="text-[#B9B2F2] tnum">{toNext} XP to level {level + 1}</span>
                <span className="tnum text-ink">{Math.round(pct * 100)}%</span>
              </div>
              <Bar value={pct} tint="amber" height={7} delay={0.15} />

              <div className="mt-5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <motion.span
                    className="grid h-8 w-8 place-items-center rounded-xl bg-amber/20 text-amber"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Icon name="flame" size={17} />
                  </motion.span>
                  <span className="text-[14px] font-extrabold">
                    <span className="tnum">{state.streak}</span> day streak
                  </span>
                </span>
                <span className="text-[13px] font-bold text-[#B9B2F2]">Keep your rhythm</span>
              </div>
            </div>
          </div>
        </Stagger.Item>

        {/* ── Today's quest ─────────────────────────────── */}
        <Stagger.Item>
          <motion.div whileTap={tap} transition={micro}>
            <Link
              href={`/session/${quest.id}`}
              className="relative block overflow-hidden rounded-[22px] border border-violet/25 p-5"
              style={{ background: `linear-gradient(140deg, ${quest.gradient[0]}, ${quest.gradient[1]})` }}
            >
              <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/10 blur-xl" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <p className="eyebrow flex items-center gap-2 text-white/85">
                    <Icon name="target" size={14} /> Today&apos;s quest
                  </p>
                  <Icon name="arrow-up-right" size={18} className="text-white/70" />
                </div>
                <h3 className="display text-[27px]">{quest.title}</h3>
                <p className="mt-1.5 text-[14px] text-white/75">
                  {quest.minutes}-minute {quest.kind === "breath" ? "breathing" : quest.kind} session
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <Pill className="bg-black/25 text-amber">
                    <Icon name="star" size={13} strokeWidth={2.4} /> +{quest.xp} XP
                  </Pill>
                  <motion.span
                    className="grid h-12 w-12 place-items-center rounded-full bg-mint text-[#04231E]"
                    whileTap={{ scale: 0.9 }}
                    animate={{ boxShadow: ["0 0 0 0 rgba(47,227,195,0.45)", "0 0 0 14px rgba(47,227,195,0)"] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                  >
                    <Icon name="play" size={19} strokeWidth={2.4} />
                  </motion.span>
                </div>
              </div>
            </Link>
          </motion.div>
        </Stagger.Item>

        {/* ── Daily progress ────────────────────────────── */}
        <Stagger.Item>
          <SectionTitle
            eyebrow="Keep going"
            title="Daily progress"
            action={
              <Link href="/challenges" className="text-[13px] font-bold text-mint">
                View all
              </Link>
            }
          />
          <Card>
            <ul className="space-y-1">
              {state.tasks.map((t, i) => {
                const next = !t.done && state.tasks.findIndex((x) => !x.done) === i;
                return (
                  <li key={t.id}>
                    <motion.button
                      onClick={() => toggleTask(t.id)}
                      whileTap={tap}
                      transition={micro}
                      aria-pressed={t.done}
                      className="flex min-h-[52px] w-full items-center gap-3 rounded-xl text-left"
                    >
                      <motion.span
                        animate={{
                          backgroundColor: t.done ? "var(--color-mint)" : "rgba(255,255,255,0)",
                          borderColor: t.done ? "var(--color-mint)" : "rgba(255,255,255,0.18)",
                        }}
                        transition={micro}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[#04231E]"
                      >
                        <AnimatePresence>
                          {t.done && (
                            <motion.span
                              initial={{ scale: 0, rotate: -25 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              transition={pop}
                            >
                              <Icon name="check" size={14} strokeWidth={3.2} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[15px] font-extrabold ${t.done ? "text-ink-3 line-through" : "text-ink"}`}>
                          {t.label}
                        </span>
                        <span className="block text-[12.5px] text-ink-3">{t.meta}</span>
                      </span>
                      {next && <span className="eyebrow text-[9.5px] text-amber">Up next</span>}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-center gap-3">
              <span className="tnum shrink-0 text-[12.5px] font-bold text-ink-2">
                {done} / {state.tasks.length} completed
              </span>
              <Bar value={state.tasks.length ? done / state.tasks.length : 0} />
            </div>
          </Card>
        </Stagger.Item>

        {/* ── Wellness check-in ─────────────────────────── */}
        <Stagger.Item>
          <SectionTitle
            eyebrow="A quick check-in"
            title="Your wellness"
            action={
              <Link href="/progress" className="text-[13px] font-bold text-mint">
                See progress
              </Link>
            }
          />
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="eyebrow mb-1.5 text-ink-3">How are you feeling?</p>
                <p className="display text-[26px]">{MOOD_WORDS[Math.max(0, Math.round(mood) - 1)]}</p>
              </div>
              <motion.button
                onClick={() => setCheckOpen((v) => !v)}
                whileTap={tap}
                transition={micro}
                aria-expanded={checkOpen}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-amber/15 text-amber"
                aria-label="Update how you feel"
              >
                <Icon name="smile" size={21} />
              </motion.button>
            </div>

            <AnimatePresence initial={false}>
              {checkOpen && (
                <motion.div
                  key="scale"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={ui}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 pt-4">
                    {MOOD_WORDS.map((w, i) => (
                      <motion.button
                        key={w}
                        whileTap={tap}
                        transition={micro}
                        onClick={() => {
                          checkIn("mood", i + 1);
                          setCheckOpen(false);
                        }}
                        className={`min-h-[44px] flex-1 rounded-xl border text-[12px] font-bold ${
                          Math.round(mood) === i + 1
                            ? "border-mint/60 bg-mint/12 text-mint"
                            : "border-hairline bg-surface-2 text-ink-2"
                        }`}
                      >
                        {w}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-hairline pt-4 text-center">
              {[
                { k: "Mood", v: MOOD_WORDS[Math.max(0, Math.round(mood) - 1)] },
                { k: "Stress", v: (today?.calm ?? 3.9) >= 3.5 ? "Low" : "Moderate" },
                { k: "Energy", v: (today?.energy ?? 3.8) >= 3.5 ? "Steady" : "Dipping" },
              ].map((c) => (
                <div key={c.k}>
                  <p className="eyebrow mb-1 text-[9.5px] text-ink-3">{c.k}</p>
                  <p className="text-[14px] font-extrabold">{c.v}</p>
                </div>
              ))}
            </div>

            {/* 7-day sparkline of mood */}
            <div className="mt-4 flex h-16 items-end gap-2">
              {state.checkIns.slice(-7).map((c, i, arr) => (
                <motion.div
                  key={c.day}
                  className="flex-1 rounded-t-md"
                  style={{
                    background:
                      i === arr.length - 1
                        ? "linear-gradient(to top, var(--color-mint), #7BF0DA)"
                        : "linear-gradient(to top, #4A3FB0, #7B6CF6)",
                    transformOrigin: "bottom",
                  }}
                  initial={{ height: 6, opacity: 0 }}
                  animate={{ height: `${(c.mood / 5) * 100}%`, opacity: 1 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.05 }}
                />
              ))}
            </div>
          </Card>
        </Stagger.Item>

        {/* ── Active challenge glance ───────────────────── */}
        <Stagger.Item>
          <Link href="/challenges" className="block">
            <motion.div whileTap={tap} transition={micro} className="card flex items-center gap-3 p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet/18 text-violet">
                <Icon name="flag" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-extrabold">{CHALLENGES[0].title}</span>
                <span className="block text-[12.5px] text-ink-2 tnum">
                  {state.challengeProgress[CHALLENGES[0].id] ?? CHALLENGES[0].done} of {CHALLENGES[0].total} days done
                </span>
              </span>
              <Icon name="chevron-right" size={18} className="text-ink-3" />
            </motion.div>
          </Link>
        </Stagger.Item>

        {/* ── Upsell ────────────────────────────────────── */}
        <Stagger.Item>
          <div className="card flex items-center gap-3 border-amber/20 bg-[linear-gradient(120deg,rgba(247,184,75,0.10),rgba(20,27,50,0.4))] p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber/18 text-amber">
              <Icon name="star" size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="eyebrow block text-[9.5px] text-amber">Zenith+</span>
              <span className="block text-[15px] font-extrabold">Go deeper with your practice.</span>
            </span>
            <Icon name="chevron-right" size={18} className="text-ink-3" />
          </div>
        </Stagger.Item>
      </Stagger>

      {!ready && <div className="pointer-events-none absolute inset-0" aria-hidden />}
    </Screen>
  );
}
