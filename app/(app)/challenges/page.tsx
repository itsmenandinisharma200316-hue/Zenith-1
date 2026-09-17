"use client";

import { motion } from "motion/react";
import { Icon, type IconName } from "@/components/Icon";
import { Bar, BackButton, Card, IconButton, Pill, Screen, SectionTitle, Stagger, TopBar } from "@/components/ui";
import { CHALLENGES } from "@/lib/data";
import { micro, tap, ui } from "@/lib/motion";
import { useStore } from "@/lib/store";

export default function Challenges() {
  const { state } = useStore();
  const hero = CHALLENGES[0];
  const heroDone = state.challengeProgress[hero.id] ?? hero.done;

  return (
    <Screen>
      <TopBar
        title="Challenges"
        subtitle="Tiny commitments. Real momentum."
        left={<BackButton />}
        right={<IconButton name="sliders" label="Challenge settings" variant="solid" />}
      />

      <Stagger className="mt-5 space-y-4">
        {/* Hero challenge */}
        <Stagger.Item>
          <div
            className="relative overflow-hidden rounded-[22px] border border-violet/25 p-5"
            style={{ background: "linear-gradient(150deg, #322C7A 0%, #262059 60%, #1E1A4A 100%)" }}
          >
            <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-violet/25 blur-2xl" />
            <div className="relative">
              <p className="eyebrow mb-3 flex items-center gap-2 text-mint">
                <Icon name="flag" size={14} /> In progress
              </p>
              <h2 className="display text-[28px]">{hero.title}</h2>
              <p className="mt-1.5 text-[14px] text-[#B9B2F2]">{hero.blurb}</p>

              {/* Day dots */}
              <div className="mt-6 flex justify-between gap-1.5">
                {Array.from({ length: hero.total }).map((_, i) => {
                  const on = i < heroDone;
                  const next = i === heroDone;
                  return (
                    <motion.div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-1.5"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...ui, delay: 0.06 * i }}
                    >
                      <span
                        className={`grid aspect-square w-full max-w-[42px] place-items-center rounded-full text-[13px] font-extrabold ${
                          on
                            ? "bg-mint text-[#04231E]"
                            : next
                              ? "border-2 border-mint/50 text-mint"
                              : "border border-white/15 text-white/45"
                        }`}
                      >
                        {on ? <Icon name="check" size={15} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="eyebrow text-[8.5px] text-white/40">Day</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-5 mb-2 flex items-baseline justify-between text-[13px] font-extrabold">
                <span className="tnum">
                  {heroDone} / {hero.total} days
                </span>
              </div>
              <Bar value={heroDone / hero.total} delay={0.2} />

              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber/18 text-amber">
                  <Icon name="medal" size={21} />
                </span>
                <span>
                  <span className="eyebrow block text-[9.5px] text-white/45">Reward</span>
                  <span className="block text-[14px] font-extrabold">
                    {hero.reward} · +{hero.xp} XP
                  </span>
                </span>
              </div>
            </div>
          </div>
        </Stagger.Item>

        <Stagger.Item>
          <SectionTitle eyebrow="More to explore" title="Keep the momentum" />
        </Stagger.Item>

        {CHALLENGES.slice(1).map((c) => {
          const done = state.challengeProgress[c.id] ?? c.done;
          return (
            <Stagger.Item key={c.id}>
              <motion.div whileTap={c.locked ? undefined : tap} transition={micro}>
                <Card className={c.locked ? "opacity-60" : ""}>
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                        c.locked ? "bg-white/6 text-ink-3" : "bg-violet/18 text-violet"
                      }`}
                    >
                      <Icon name={(c.locked ? "lock" : c.icon) as IconName} size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[16px] font-extrabold tracking-[-0.01em]">{c.title}</p>
                      <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{c.blurb}</p>
                    </div>
                    {c.locked ? (
                      <Pill>Locked</Pill>
                    ) : (
                      <span className="tnum shrink-0 text-[14px] font-extrabold text-mint">
                        {done} / {c.total}
                      </span>
                    )}
                  </div>
                  {!c.locked && (
                    <div className="mt-3.5">
                      <Bar value={done / c.total} tint="violet" height={5} />
                    </div>
                  )}
                </Card>
              </motion.div>
            </Stagger.Item>
          );
        })}
      </Stagger>
    </Screen>
  );
}
