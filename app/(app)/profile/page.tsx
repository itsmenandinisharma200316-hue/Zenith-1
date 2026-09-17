"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { ShareComposer } from "@/components/ShareComposer";
import { Avatar, Bar, Card, Pill, Screen, SectionTitle, Stagger, TopBar } from "@/components/ui";
import { CHALLENGES, GOALS, levelFor, sessionById } from "@/lib/data";
import { micro, tap } from "@/lib/motion";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const [sharing, setSharing] = useState(false);

  const name = state.profile.name || "friend";
  const handle = state.profile.handle || "you";
  const { level, pct, toNext } = levelFor(state.xp);
  const minutes = state.activities.reduce((n, a) => n + a.minutes, 0);

  const badges = CHALLENGES.map((c) => ({
    ...c,
    earned: (state.challengeProgress[c.id] ?? c.done) >= c.total,
  }));

  return (
    <>
      <Screen>
        <TopBar title="Profile" right={<button aria-label="Settings" className="grid h-11 w-11 place-items-center rounded-2xl border border-hairline bg-surface-2"><Icon name="sliders" size={20} /></button>} />

        <Stagger className="mt-5 space-y-4">
          {/* Identity */}
          <Stagger.Item>
            <div className="flex flex-col items-center py-2 text-center">
              <Avatar initials={name[0]?.toUpperCase() ?? "Z"} hue={262} size={84} ring />
              <h2 className="display mt-4 text-[26px] capitalize">{name}</h2>
              <p className="mt-0.5 text-[14px] text-ink-2">@{handle}</p>
              <div className="mt-3 flex gap-2">
                <Pill tint="mint">
                  <Icon name="flame" size={12} strokeWidth={2.3} /> {state.streak} day streak
                </Pill>
                <Pill tint="amber">
                  <Icon name="star" size={12} strokeWidth={2.3} /> Level {level}
                </Pill>
              </div>
            </div>
          </Stagger.Item>

          {/* Level */}
          <Stagger.Item>
            <Card>
              <div className="mb-2.5 flex items-baseline justify-between text-[13px] font-extrabold">
                <span>Level {level}</span>
                <span className="tnum text-ink-2">{toNext} XP to go</span>
              </div>
              <Bar value={pct} tint="amber" height={7} />
              <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--color-hairline)] border-t border-hairline pt-4 text-center">
                {[
                  ["Sessions", String(state.activities.length)],
                  ["Minutes", String(minutes)],
                  ["Total XP", state.xp.toLocaleString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="display tnum text-[20px]">{v}</p>
                    <p className="eyebrow mt-1 text-[9px] text-ink-3">{k}</p>
                  </div>
                ))}
              </div>
            </Card>
          </Stagger.Item>

          {/* Share profile card */}
          <Stagger.Item>
            <motion.button onClick={() => setSharing(true)} whileTap={tap} transition={micro} className="w-full">
              <Card className="flex items-center gap-3.5 border-mint/25 bg-[linear-gradient(120deg,rgba(47,227,195,0.10),rgba(20,27,50,0.5))]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint/16 text-mint">
                  <Icon name="share" size={21} />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[16px] font-extrabold">Share your streak card</span>
                  <span className="mt-0.5 block text-[13px] text-ink-2">A milestone card for stories and feeds.</span>
                </span>
                <Icon name="chevron-right" size={18} className="text-ink-3" />
              </Card>
            </motion.button>
          </Stagger.Item>

          {/* Badges */}
          <Stagger.Item>
            <SectionTitle eyebrow="Collection" title="Badges" />
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <Card key={b.id} className={`flex flex-col gap-2 ${b.earned ? "" : "opacity-55"}`}>
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl ${
                      b.earned ? "bg-amber/18 text-amber" : "bg-white/6 text-ink-3"
                    }`}
                  >
                    <Icon name={(b.earned ? "medal" : "lock") as IconName} size={20} />
                  </span>
                  <span className="text-[14px] font-extrabold leading-tight">{b.reward}</span>
                  <span className="tnum text-[12px] text-ink-3">
                    {b.earned ? "Earned" : `${state.challengeProgress[b.id] ?? b.done} / ${b.total}`}
                  </span>
                </Card>
              ))}
            </div>
          </Stagger.Item>

          {/* Focus areas */}
          <Stagger.Item>
            <SectionTitle eyebrow="Set at onboarding" title="Your focus" />
            <Card>
              <div className="flex flex-wrap gap-2">
                {state.profile.goals.length ? (
                  state.profile.goals.map((g) => (
                    <Pill key={g} tint="violet">
                      {GOALS.find((x) => x.id === g)?.label ?? g}
                    </Pill>
                  ))
                ) : (
                  <p className="text-[14px] text-ink-2">No focus areas set yet.</p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline pt-4">
                <div>
                  <p className="eyebrow mb-1 text-[9.5px] text-ink-3">Daily time</p>
                  <p className="text-[15px] font-extrabold tnum">{state.profile.minutesPerDay} min</p>
                </div>
                <div>
                  <p className="eyebrow mb-1 text-[9.5px] text-ink-3">Reminder</p>
                  <p className="text-[15px] font-extrabold">{state.profile.reminder ?? "Off"}</p>
                </div>
              </div>
            </Card>
          </Stagger.Item>

          {/* Settings-ish rows */}
          <Stagger.Item>
            <Card className="divide-y divide-[var(--color-hairline)] p-0">
              {[
                { icon: "sliders" as IconName, label: "Redo onboarding", onClick: () => router.push("/onboarding") },
                {
                  icon: "x" as IconName,
                  label: "Reset demo data",
                  onClick: () => {
                    dispatch({ type: "reset" });
                    router.push("/home");
                  },
                },
              ].map((row) => (
                <button
                  key={row.label}
                  onClick={row.onClick}
                  className="flex min-h-[54px] w-full items-center gap-3 px-4 text-left"
                >
                  <Icon name={row.icon} size={19} className="text-ink-3" />
                  <span className="flex-1 text-[15px] font-bold">{row.label}</span>
                  <Icon name="chevron-right" size={17} className="text-ink-3" />
                </button>
              ))}
            </Card>
          </Stagger.Item>
        </Stagger>
      </Screen>

      <ShareComposer
        open={sharing}
        onClose={() => setSharing(false)}
        data={{
          title: `${state.streak} days of showing up`,
          minutes,
          xp: state.xp,
          streak: state.streak,
          handle,
          name,
          dateLabel: "This month",
          milestone: `${state.streak}-day streak`,
          pattern: sessionById("reset-your-mind")?.pattern ?? [4, 4, 4, 4],
        }}
      />
    </>
  );
}
