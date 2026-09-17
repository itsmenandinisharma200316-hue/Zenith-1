"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Counter } from "@/components/Counter";
import { Card, IconButton, Screen, SectionTitle, Segmented, Stagger, TopBar } from "@/components/ui";
import { ui } from "@/lib/motion";
import { useStore } from "@/lib/store";
import type { MetricId } from "@/lib/types";

const METRICS: { id: MetricId; label: string; icon: "smile" | "wind" | "bolt" | "moon" }[] = [
  { id: "mood", label: "Mood", icon: "smile" },
  { id: "calm", label: "Calm", icon: "wind" },
  { id: "energy", label: "Energy", icon: "bolt" },
  { id: "sleep", label: "Sleep", icon: "moon" },
];

export default function Progress() {
  const { state } = useStore();
  const [metric, setMetric] = useState<MetricId>("mood");

  const sessions = state.activities.length;
  const minutes = state.activities.reduce((n, a) => n + a.minutes, 0);
  const avg = sessions ? Math.round(minutes / sessions) : 0;
  const consistency = Math.min(100, Math.round((state.checkIns.length / 7) * 82) || 82);

  const series = useMemo(() => state.checkIns.slice(-7).map((c) => c[metric]), [state.checkIns, metric]);
  const days = useMemo(
    () =>
      state.checkIns
        .slice(-7)
        .map((c) => new Date(c.day + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" })),
    [state.checkIns],
  );

  const trend = series.length > 1 ? series[series.length - 1] - series[0] : 0;

  return (
    <Screen>
      <TopBar
        title="Your progress"
        subtitle="See the practice, not a score."
        right={<IconButton name="calendar" label="Open calendar" variant="solid" />}
      />

      <Stagger className="mt-5 space-y-4">
        {/* Headline stats */}
        <Stagger.Item>
          <Card className="p-0">
            <div className="grid grid-cols-2 divide-x divide-[var(--color-hairline)]">
              <Stat value={<Counter value={sessions} />} label="Sessions completed" />
              <Stat
                value={
                  <>
                    <Counter value={Math.floor(minutes / 60)} />h <Counter value={minutes % 60} />m
                  </>
                }
                label="Total practice"
              />
            </div>
            <div className="grid grid-cols-2 divide-x divide-[var(--color-hairline)] border-t border-hairline">
              <Stat value={<><Counter value={avg} /> min</>} label="Average session" tint="mint" small />
              <Stat value={<><Counter value={consistency} />%</>} label="Consistency" tint="mint" small />
            </div>
          </Card>
        </Stagger.Item>

        {/* Wellness chart */}
        <Stagger.Item>
          <SectionTitle eyebrow="Wellness check-ins" title="Your week" />
          <Card>
            <Segmented
              layoutId="metric-tab"
              value={metric}
              onChange={setMetric}
              options={METRICS.map((m) => ({ id: m.id, label: m.label, icon: m.icon }))}
            />

            <div className="mt-5">
              <LineChart key={metric} values={series} labels={days} />
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-hairline pt-4">
              <span
                className={`grid h-8 w-8 place-items-center rounded-xl ${
                  trend >= 0 ? "bg-mint/14 text-mint" : "bg-rose/14 text-rose"
                }`}
              >
                <Icon name="trend" size={16} style={trend < 0 ? { transform: "scaleY(-1)" } : undefined} />
              </span>
              <p className="text-[13.5px] text-ink-2">
                {trend >= 0 ? "Trending up" : "Trending down"} over the last 7 days ·{" "}
                <span className="font-extrabold text-ink">
                  {trend >= 0 ? "+" : ""}
                  {trend.toFixed(1)}
                </span>
              </p>
            </div>
          </Card>
        </Stagger.Item>

        {/* Encouragement */}
        <Stagger.Item>
          <Card className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint/14 text-mint">
              <Icon name="trend" size={21} />
            </span>
            <span>
              <span className="block text-[16px] font-extrabold">You&apos;re building a consistent practice.</span>
              <span className="mt-0.5 block text-[13.5px] text-ink-2">Your rhythm is yours to define.</span>
            </span>
          </Card>
        </Stagger.Item>

        {/* Recent activity */}
        <Stagger.Item>
          <SectionTitle eyebrow="History" title="Recent sessions" />
          <Card className="divide-y divide-[var(--color-hairline)] p-0">
            {state.activities.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet/18 text-violet">
                  <Icon name="check" size={17} strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-extrabold">{a.title}</span>
                  <span className="tnum block text-[12px] text-ink-3">
                    {a.minutes} min ·{" "}
                    {new Date(a.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </span>
                <span className="tnum shrink-0 text-[13px] font-extrabold text-amber">+{a.xp}</span>
              </div>
            ))}
            {state.activities.length === 0 && (
              <p className="px-4 py-6 text-center text-[14px] text-ink-2">No sessions yet — start one from Home.</p>
            )}
          </Card>
        </Stagger.Item>

        <Stagger.Item>
          <p className="px-2 pb-2 text-center text-[12.5px] leading-relaxed text-ink-3">
            Wellness and game progress stay separate. Levels and streaks never change what your check-ins say.
          </p>
        </Stagger.Item>
      </Stagger>
    </Screen>
  );
}

function Stat({
  value,
  label,
  tint,
  small,
}: {
  value: React.ReactNode;
  label: string;
  tint?: "mint";
  small?: boolean;
}) {
  return (
    <div className="p-4">
      <p className={`display tnum ${small ? "text-[26px]" : "text-[34px]"} ${tint === "mint" ? "text-mint" : ""}`}>
        {value}
      </p>
      <p className="eyebrow mt-1.5 text-[9.5px] text-ink-3">{label}</p>
    </div>
  );
}

/** Animated SVG line chart. The path draws itself, then the dots land. */
function LineChart({ values, labels }: { values: number[]; labels: string[] }) {
  // Before hydration there are no check-ins yet; a one-point path has no shape
  // and would emit an invalid `d` attribute.
  if (values.length < 2) {
    return (
      <div className="grid h-[130px] place-items-center text-[13.5px] text-ink-3">
        Check in for a couple of days to see your trend.
      </div>
    );
  }

  const W = 300;
  const H = 130;
  const P = 10;
  const min = 1;
  const max = 5;

  const pts = values.map((v, i) => {
    const x = P + (i / Math.max(1, values.length - 1)) * (W - P * 2);
    const y = H - P - ((v - min) / (max - min)) * (H - P * 2);
    return [x, y] as const;
  });

  // Catmull-Rom → cubic Bézier for a curve that passes through every point.
  const d = pts.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p[0]} ${p[1]}`;
    const p0 = arr[i - 2] ?? arr[i - 1];
    const p1 = arr[i - 1];
    const p2 = p;
    const p3 = arr[i + 1] ?? p;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    return `${acc} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }, "");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Seven day trend: ${values.join(", ")}`}>
        {/* Baselines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={P} x2={W - P} y1={P + f * (H - P * 2)} y2={P + f * (H - P * 2)} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mint)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-mint)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <AnimatePresence mode="wait">
          <motion.path
            key={`fill-${values.join()}`}
            d={`${d} L ${W - P} ${H - P} L ${P} ${H - P} Z`}
            fill="url(#fillGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          />
        </AnimatePresence>

        <motion.path
          key={`line-${values.join()}`}
          d={d}
          fill="none"
          stroke="var(--color-mint)"
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />

        {pts.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={i === pts.length - 1 ? 4.5 : 3}
            fill={i === pts.length - 1 ? "var(--color-mint)" : "var(--color-abyss)"}
            stroke="var(--color-mint)"
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...ui, delay: 0.35 + i * 0.05 }}
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between px-1">
        {labels.map((l, i) => (
          <span key={i} className="text-[11.5px] font-semibold text-ink-3">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
