"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, Logo, type IconName } from "@/components/Icon";
import { Button } from "@/components/ui";
import { GOALS, MOTIVATIONS } from "@/lib/data";
import { micro, tap, ui } from "@/lib/motion";
import { useActions } from "@/lib/store";
import type { GoalId, MotivationId } from "@/lib/types";

const TOTAL = 4;
const TIMES = [5, 10, 15, 20];
const REMINDERS = ["Morning", "Midday", "Evening", "No reminders"];

export default function Onboarding() {
  const router = useRouter();
  const { setProfile } = useActions();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [goals, setGoals] = useState<GoalId[]>(["calm"]);
  const [minutes, setMinutes] = useState(5);
  const [motivation, setMotivation] = useState<MotivationId>("streaks");
  const [name, setName] = useState("");
  const [reminder, setReminder] = useState<string>("Evening");

  const go = (delta: number) => {
    setDir(delta);
    setStep((s) => s + delta);
  };

  const finish = () => {
    setProfile({
      name: name.trim() || "friend",
      handle: (name.trim() || "you").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14) || "you",
      goals,
      minutesPerDay: minutes,
      motivation,
      reminder: reminder === "No reminders" ? null : reminder,
      onboarded: true,
    });
    router.push("/home");
  };

  const canContinue = step === 0 ? goals.length > 0 : true;

  return (
    <main
      className="relative flex min-h-dvh flex-col px-5"
      style={{ paddingTop: "calc(var(--safe-t) + 18px)", paddingBottom: "calc(var(--safe-b) + 22px)" }}
    >
      {/* Header + progress */}
      <div className="mb-7 flex items-center justify-between">
        <Logo size={36} />
        <span className="tnum text-[14px] font-bold text-ink-2">
          {step + 1} / {TOTAL}
        </span>
      </div>

      <div className="mb-8 flex gap-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL}>
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-mint"
              style={{ transformOrigin: "left" }}
              initial={false}
              animate={{ scaleX: i <= step ? 1 : 0 }}
              transition={ui}
            />
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 34 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24, transition: { duration: 0.16, ease: [0.42, 0, 1, 1] } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <Step eyebrow="Make it yours" title={"What would you like\nto work on?"} hint="Choose as many as feel right today.">
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map((g) => {
                    const on = goals.includes(g.id);
                    return (
                      <motion.button
                        key={g.id}
                        onClick={() =>
                          setGoals((v) => (on ? v.filter((x) => x !== g.id) : [...v, g.id]))
                        }
                        whileTap={tap}
                        transition={micro}
                        aria-pressed={on}
                        className={`relative flex min-h-[132px] flex-col justify-between rounded-2xl border p-4 text-left ${
                          on ? "border-mint/60 bg-mint/8" : "border-hairline bg-surface"
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 place-items-center rounded-xl ${
                            g.tint === "mint" ? "bg-mint/14 text-mint"
                            : g.tint === "amber" ? "bg-amber/14 text-amber"
                            : "bg-violet/18 text-violet"
                          }`}
                        >
                          <Icon name={g.icon as IconName} size={21} />
                        </span>
                        <span className="text-[16px] font-extrabold tracking-[-0.01em]">{g.label}</span>
                        <AnimatePresence>
                          {on && (
                            <motion.span
                              key="tick"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 420, damping: 22 }}
                              className="absolute right-3.5 top-3.5 grid h-6 w-6 place-items-center rounded-full bg-mint text-[#04231E]"
                            >
                              <Icon name="check" size={13} strokeWidth={3} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step eyebrow="Your rhythm" title={"How much time can\nyou give yourself?"} hint="Small moments count. Pick what feels realistic.">
                <div className="space-y-2.5">
                  {TIMES.map((m) => (
                    <Choice key={m} label={`${m}${m === 20 ? "+" : ""} minutes`} on={minutes === m} onClick={() => setMinutes(m)} />
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step eyebrow="What keeps you going" title="What motivates you most?" hint="Zenith will keep the right things in view.">
                <div className="space-y-2.5">
                  {MOTIVATIONS.map((m) => (
                    <Choice
                      key={m.id}
                      label={m.label}
                      on={motivation === m.id}
                      onClick={() => setMotivation(m.id as MotivationId)}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step eyebrow="Last thing" title="What should we call you?" hint="Used for your greeting and your share cards.">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="given-name"
                  maxLength={24}
                  className="mb-7 w-full rounded-2xl border border-hairline bg-surface px-4 py-4 text-[17px] font-bold
                             placeholder:font-semibold placeholder:text-ink-3 focus:border-mint/60 focus:outline-none"
                />
                <p className="eyebrow mb-3 text-ink-3">Nudge me</p>
                <div className="flex flex-wrap gap-2">
                  {REMINDERS.map((r) => (
                    <motion.button
                      key={r}
                      onClick={() => setReminder(r)}
                      whileTap={tap}
                      transition={micro}
                      aria-pressed={reminder === r}
                      className={`min-h-[44px] rounded-xl border px-4 text-[14px] font-bold ${
                        reminder === r ? "border-mint/60 bg-mint/10 text-mint" : "border-hairline bg-surface text-ink-2"
                      }`}
                    >
                      {r}
                    </motion.button>
                  ))}
                </div>
              </Step>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA — bottom third, thumb zone */}
      <div className="space-y-1 pt-6">
        <Button
          onClick={() => (step === TOTAL - 1 ? finish() : go(1))}
          icon={step === TOTAL - 1 ? "check" : "arrow-right"}
          disabled={!canContinue}
        >
          {step === TOTAL - 1 ? "Start practising" : "Continue"}
        </Button>
        {step > 0 && (
          <button
            onClick={() => go(-1)}
            className="grid min-h-[48px] w-full place-items-center text-[15px] font-bold text-ink-2"
          >
            Back
          </button>
        )}
      </div>
    </main>
  );
}

function Step({
  eyebrow,
  title,
  hint,
  children,
}: {
  eyebrow: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow mb-3 text-mint">{eyebrow}</p>
      <h1 className="display mb-3 whitespace-pre-line text-[34px]">{title}</h1>
      <p className="mb-7 text-[15px] leading-relaxed text-ink-2">{hint}</p>
      {children}
    </div>
  );
}

function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={tap}
      transition={micro}
      aria-pressed={on}
      className={`flex min-h-[64px] w-full items-center justify-between rounded-2xl border px-5 text-left ${
        on ? "border-mint/60 bg-mint/8" : "border-hairline bg-surface"
      }`}
    >
      <span className={`text-[17px] font-bold ${on ? "text-ink" : "text-ink-2"}`}>{label}</span>
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
          on ? "border-mint bg-mint text-[#04231E]" : "border-white/18"
        }`}
      >
        {on && <Icon name="check" size={13} strokeWidth={3} />}
      </span>
    </motion.button>
  );
}
