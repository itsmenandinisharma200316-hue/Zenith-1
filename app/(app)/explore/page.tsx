"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { Card, Pill, Screen, SectionTitle, Segmented, Stagger, TopBar } from "@/components/ui";
import { GOALS, SESSIONS } from "@/lib/data";
import { micro, tap } from "@/lib/motion";
import { useStore } from "@/lib/store";
import type { GoalId } from "@/lib/types";

type Filter = "all" | GoalId;

export default function Explore() {
  const { state } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const list = filter === "all" ? SESSIONS : SESSIONS.filter((s) => s.goal === filter);
  const forYou = SESSIONS.filter((s) => state.profile.goals.includes(s.goal)).slice(0, 4);

  return (
    <Screen>
      <TopBar title="Explore" subtitle="Find the one that fits this moment." />

      {/* For you rail */}
      {forYou.length > 0 && (
        <section className="mt-5">
          <SectionTitle eyebrow="Picked from your goals" title="For you" />
          <div className="-mx-5 overflow-x-auto no-bar edge-fade">
            <div className="flex gap-3 px-5 pb-1">
              {forYou.map((s) => (
                <motion.div key={s.id} whileTap={tap} transition={micro} className="shrink-0">
                  <Link
                    href={`/session/${s.id}`}
                    className="relative flex h-[168px] w-[172px] flex-col justify-between overflow-hidden rounded-[20px] border border-white/10 p-4"
                    style={{ background: `linear-gradient(145deg, ${s.gradient[0]}, ${s.gradient[1]})` }}
                  >
                    <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/12 blur-lg" />
                    {/* Scrim: the gradients range from deep violet to bright mint,
                        so white text needs a guaranteed dark ground underneath. */}
                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                    <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-black/25">
                      <Icon name={iconFor(s.goal)} size={19} />
                    </span>
                    <span className="relative">
                      <span className="block text-[17px] font-extrabold leading-tight tracking-[-0.02em]">{s.title}</span>
                      <span className="tnum mt-1 block text-[12.5px] text-white/75">
                        {s.minutes} min · +{s.xp} XP
                      </span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filter */}
      <div className="sticky top-[84px] z-20 -mx-5 mt-7 bg-abyss/90 px-5 py-2 backdrop-blur-xl">
        <Segmented
          layoutId="explore-filter"
          value={filter}
          onChange={setFilter}
          options={[
            { id: "all" as Filter, label: "All" },
            ...GOALS.map((g) => ({ id: g.id as Filter, label: g.label.replace(" & Calm", ""), icon: g.icon as IconName })),
          ]}
        />
      </div>

      {/* Library */}
      <Stagger className="mt-3 space-y-3">
        {list.map((s) => (
          <Stagger.Item key={s.id}>
            <motion.div whileTap={tap} transition={micro}>
              <Link href={`/session/${s.id}`}>
                <Card className="flex items-center gap-3.5">
                  <span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                    style={{ background: `linear-gradient(145deg, ${s.gradient[0]}, ${s.gradient[1]})` }}
                  >
                    <Icon name={iconFor(s.goal)} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-extrabold tracking-[-0.01em]">{s.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-2">{s.subtitle}</span>
                    <span className="mt-2 flex gap-1.5">
                      <Pill>{s.minutes} min</Pill>
                      <Pill tint="amber">+{s.xp} XP</Pill>
                    </span>
                  </span>
                  <Icon name="play" size={18} className="shrink-0 text-mint" strokeWidth={2.2} />
                </Card>
              </Link>
            </motion.div>
          </Stagger.Item>
        ))}
      </Stagger>
    </Screen>
  );
}

function iconFor(goal: GoalId): IconName {
  return (GOALS.find((g) => g.id === goal)?.icon ?? "wind") as IconName;
}
