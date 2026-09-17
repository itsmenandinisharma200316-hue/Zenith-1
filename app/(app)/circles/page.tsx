"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { Kudos } from "@/components/Kudos";
import { ShareComposer } from "@/components/ShareComposer";
import { StoryViewer, type Story } from "@/components/StoryViewer";
import { Avatar, Bar, Card, Pill, Screen, SectionTitle, Stagger, TopBar } from "@/components/ui";
import { FRIENDS, sessionById } from "@/lib/data";
import { micro, tap, ui } from "@/lib/motion";
import { relTime } from "@/lib/time";
import { useActions, useStore } from "@/lib/store";
import type { FeedPost } from "@/lib/types";

const KIND_ICON = {
  breath: "wind",
  body: "pulse",
  focus: "target",
  sleep: "moon",
  reflect: "smile",
} as const;

export default function Circles() {
  const { state } = useStore();
  const { kudos, seeStory, post } = useActions();
  const [storyAt, setStoryAt] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [reshare, setReshare] = useState<FeedPost | null>(null);
  const [filter, setFilter] = useState<"all" | "mine">("all");

  const me = state.profile.name || "You";
  const lastActivity = state.activities[0];

  /* Friends' stories are their own share cards, drawn with the same renderer. */
  const stories = useMemo<Story[]>(
    () =>
      state.feed.slice(0, 5).map((p, i) => ({
        id: p.id,
        name: p.author.name,
        handle: p.author.handle,
        initials: p.author.initials,
        hue: p.author.hue,
        theme: (["aurora", "mint", "ember", "aurora", "mono"] as const)[i % 5],
        timeLabel: relTime(p.at),
        card: {
          title: p.title,
          minutes: p.minutes,
          xp: p.minutes * 20,
          streak: p.streak,
          handle: p.author.handle,
          name: p.author.name,
          dateLabel: relTime(p.at),
          note: p.note,
          milestone: p.milestone,
          pattern: sessionById(p.title.toLowerCase().replace(/\s+/g, "-"))?.pattern ?? [4, 4, 4, 4],
        },
      })),
    [state.feed],
  );

  const visible = filter === "mine" ? state.feed.filter((p) => p.author.handle === state.profile.handle) : state.feed;

  const weekMinutes = state.activities.reduce((n, a) => n + a.minutes, 0);
  const board = useMemo(
    () =>
      [
        { id: "me", name: me, initials: (me[0] ?? "Y").toUpperCase(), hue: 262, minutes: weekMinutes, mine: true },
        ...FRIENDS.slice(0, 4).map((f) => ({
          id: f.id,
          name: f.name,
          initials: f.initials,
          hue: f.hue,
          minutes: 18 + f.streak * 4,
          mine: false,
        })),
      ].sort((a, b) => b.minutes - a.minutes),
    [me, weekMinutes],
  );
  const top = board[0]?.minutes || 1;

  /* Share whatever the user last did — or a starter card if they're new. */
  const shareData = {
    title: lastActivity?.title ?? "Reset Your Mind",
    minutes: lastActivity?.minutes ?? 5,
    xp: lastActivity?.xp ?? 100,
    streak: state.streak,
    handle: state.profile.handle || "you",
    name: me,
    dateLabel: lastActivity ? relTime(lastActivity.at) : "Today",
    pattern: sessionById(lastActivity?.sessionId ?? "reset-your-mind")?.pattern ?? ([4, 4, 4, 4] as [number, number, number, number]),
  };

  /* Resharing a friend's moment renders *their* card, credited to them. */
  const reshareData = reshare && {
    title: reshare.title,
    minutes: reshare.minutes,
    xp: reshare.minutes * 20,
    streak: reshare.streak,
    handle: reshare.author.handle,
    name: reshare.author.name,
    dateLabel: relTime(reshare.at),
    note: reshare.note,
    milestone: reshare.milestone,
    pattern:
      sessionById(reshare.title.toLowerCase().replace(/\s+/g, "-"))?.pattern ??
      ([4, 4, 4, 4] as [number, number, number, number]),
  };

  return (
    <>
      <Screen>
        <TopBar
          title="Circles"
          subtitle="Practice is private. Progress is better shared."
          right={<button aria-label="Find friends" className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-2 border border-hairline text-ink"><Icon name="plus" size={20} /></button>}
        />

        {/* ── Stories rail ──────────────────────────────── */}
        <div className="-mx-5 mt-4 overflow-x-auto no-bar edge-fade">
          <div className="flex gap-3.5 px-5 pb-1">
            {/* Your own card */}
            <motion.button
              onClick={() => setComposing(true)}
              whileTap={tap}
              transition={micro}
              className="flex w-[68px] shrink-0 flex-col items-center gap-2"
            >
              <span className="relative">
                <Avatar initials={(me[0] ?? "Y").toUpperCase()} hue={262} size={60} />
                <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full border-[3px] border-abyss bg-mint text-[#04231E]">
                  <Icon name="plus" size={13} strokeWidth={3} />
                </span>
              </span>
              <span className="truncate text-[11.5px] font-bold text-ink-2">Your card</span>
            </motion.button>

            {stories.map((s, i) => {
              const seen = state.seenStories.includes(s.id);
              return (
                <motion.button
                  key={s.id}
                  onClick={() => setStoryAt(i)}
                  whileTap={tap}
                  transition={micro}
                  className="flex w-[68px] shrink-0 flex-col items-center gap-2"
                >
                  <Avatar initials={s.initials} hue={s.hue} size={60} ring dimRing={seen} />
                  <span className={`truncate text-[11.5px] font-bold ${seen ? "text-ink-3" : "text-ink"}`}>
                    {s.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Stagger className="mt-7 space-y-4">
          {/* ── Weekly board ────────────────────────────── */}
          <Stagger.Item>
            <SectionTitle eyebrow="This week" title="Your circle" />
            <Card className="space-y-3">
              {board.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="tnum w-4 shrink-0 text-[13px] font-extrabold text-ink-3">{i + 1}</span>
                  <Avatar initials={b.initials} hue={b.hue} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <span className={`truncate text-[14px] font-extrabold ${b.mine ? "text-mint" : "text-ink"}`}>
                        {b.mine ? "You" : b.name}
                      </span>
                      <span className="tnum shrink-0 text-[12.5px] font-bold text-ink-2">{b.minutes} min</span>
                    </div>
                    <Bar value={b.minutes / top} tint={b.mine ? "mint" : "violet"} height={5} delay={i * 0.06} />
                  </div>
                </div>
              ))}
              <p className="border-t border-hairline pt-3 text-[12.5px] leading-relaxed text-ink-3">
                Minutes practised, nothing else. No scores, no rankings you didn&apos;t ask for.
              </p>
            </Card>
          </Stagger.Item>

          {/* ── Feed ────────────────────────────────────── */}
          <Stagger.Item>
            <SectionTitle eyebrow="Recently" title="From your circle" />
            {/* Its own row: the compose button floats over the right edge, so
                nothing interactive may live there. */}
            <div className="mb-3 flex gap-1 rounded-xl bg-surface-2 p-1">
              {(["all", "mine"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`relative min-h-[38px] flex-1 rounded-lg text-[13px] font-extrabold ${
                    filter === f ? "text-mint" : "text-ink-3"
                  }`}
                >
                  {filter === f && (
                    <motion.span layoutId="feed-filter" transition={ui} className="absolute inset-0 rounded-lg bg-mint/12" />
                  )}
                  <span className="relative">{f === "all" ? "Everyone" : "Just me"}</span>
                </button>
              ))}
            </div>
          </Stagger.Item>

          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={ui}
              >
                <PostCard post={p} onKudos={() => kudos(p.id)} onShare={() => setReshare(p)} />
              </motion.div>
            ))}
          </AnimatePresence>

          {visible.length === 0 && (
            <Stagger.Item>
              <Card className="grid place-items-center gap-2 py-9 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint/12 text-mint">
                  <Icon name="share" size={22} />
                </span>
                <p className="text-[16px] font-extrabold">Nothing here yet</p>
                <p className="max-w-[28ch] text-[14px] leading-relaxed text-ink-2">
                  Finish a session and share the card — it&apos;s the fastest way to pull people in.
                </p>
              </Card>
            </Stagger.Item>
          )}
        </Stagger>

        {/* Floating compose button, bottom-right thumb arc */}
        <motion.button
          onClick={() => setComposing(true)}
          whileTap={{ scale: 0.92 }}
          transition={micro}
          aria-label="Create a share card"
          className="fixed right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-mint text-[#04231E]
                     shadow-[0_16px_40px_-10px_rgba(47,227,195,0.8)]"
          style={{ bottom: "calc(var(--tabbar) + var(--safe-b) + 16px)" }}
        >
          <Icon name="camera" size={22} strokeWidth={2.1} />
        </motion.button>
      </Screen>

      <AnimatePresence>
        {storyAt !== null && (
          <StoryViewer
            stories={stories}
            startIndex={storyAt}
            onClose={() => setStoryAt(null)}
            onSeen={seeStory}
          />
        )}
      </AnimatePresence>

      {reshareData && (
        <ShareComposer open onClose={() => setReshare(null)} data={reshareData} />
      )}

      <ShareComposer
        open={composing}
        onClose={() => setComposing(false)}
        data={shareData}
        onShared={() => {
          post({
            id: `me-${Date.now()}`,
            author: {
              id: "me",
              name: me,
              handle: state.profile.handle || "you",
              initials: (me[0] ?? "Y").toUpperCase(),
              hue: 262,
              streak: state.streak,
              fresh: true,
            },
            title: shareData.title,
            kind: "breath",
            minutes: shareData.minutes,
            at: new Date().toISOString(),
            streak: state.streak,
            kudos: 0,
            kudosByMe: false,
          });
        }}
      />
    </>
  );
}

function PostCard({
  post: p,
  onKudos,
  onShare,
}: {
  post: FeedPost;
  onKudos: () => void;
  onShare: () => void;
}) {
  const milestone = Boolean(p.milestone);
  return (
    <article
      className={`card overflow-hidden p-0 ${milestone ? "border-amber/28" : ""}`}
      style={
        milestone
          ? { background: "linear-gradient(140deg, rgba(247,184,75,0.12), rgba(20,27,50,0.6) 62%)" }
          : undefined
      }
    >
      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <Avatar initials={p.author.initials} hue={p.author.hue} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-extrabold">{p.author.name}</p>
          <p className="truncate text-[12px] text-ink-3">
            @{p.author.handle} · {relTime(p.at)}
          </p>
        </div>
        {p.streak >= 7 && (
          <Pill tint="amber">
            <Icon name="flame" size={12} strokeWidth={2.2} />
            <span className="tnum">{p.streak}</span>
          </Pill>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5">
        {milestone && <p className="eyebrow mb-1.5 text-amber">{p.milestone}</p>}
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
              milestone ? "bg-amber/18 text-amber" : "bg-violet/18 text-violet"
            }`}
          >
            <Icon name={KIND_ICON[p.kind]} size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold tracking-[-0.02em]">{p.title}</p>
            <p className="tnum text-[12.5px] text-ink-2">
              {p.minutes} min · {p.kind}
            </p>
          </div>
        </div>

        {p.note && (
          <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2">{p.note}</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-hairline px-4 py-3">
        <Kudos count={p.kudos} on={p.kudosByMe} onToggle={onKudos} />
        <button
          onClick={onShare}
          className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-hairline bg-surface-2 px-3 text-[13px] font-bold text-ink-2"
        >
          <Icon name="share" size={15} />
          Share
        </button>
        <span className="ml-auto text-[12px] font-bold text-ink-3">Zenith</span>
      </div>
    </article>
  );
}
