"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { CHALLENGES, FRIENDS, SESSIONS } from "./data";
import type { Activity, AppState, CheckIn, FeedPost, MetricId, Profile } from "./types";

const KEY = "zenith.state.v1";

/* ───────────────────────── helpers ───────────────────────── */

export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

/**
 * Empty shell used for the server render. Real data is loaded from storage (or
 * seeded) on mount, so the first paint is identical on both sides.
 */
const emptyState: AppState = {
  profile: {
    name: "",
    handle: "",
    goals: [],
    minutesPerDay: 5,
    motivation: null,
    reminder: null,
    onboarded: false,
  },
  xp: 0,
  streak: 0,
  activities: [],
  checkIns: [],
  tasks: [],
  challengeProgress: {},
  feed: [],
  seenStories: [],
};

/** A believable starting point so the app never looks like an empty demo. */
function seedState(): AppState {
  const today = new Date();
  const checkIns: CheckIn[] = [];
  const moods = [3.1, 3.4, 3.2, 3.8, 3.6, 4.1, 4.0];
  const calms = [2.8, 3.2, 3.5, 3.4, 3.9, 4.0, 4.2];
  const energies = [3.5, 3.0, 3.3, 3.6, 3.4, 3.8, 3.9];
  const sleeps = [2.9, 3.1, 3.6, 3.5, 3.7, 3.9, 4.1];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = 6 - i;
    checkIns.push({ day: isoDay(d), mood: moods[k], calm: calms[k], energy: energies[k], sleep: sleeps[k] });
  }

  /* Three weeks of practice, so the stats screen reads like a real account
     rather than an empty demo. Deterministic: same history on every device. */
  const plan: [string, number, number, number][] = [
    // [sessionId, hoursAgo, minutes, xp]
    ["unclench", 5, 4, 80],
    ["ground", 26, 5, 100],
    ["reset-your-mind", 31, 5, 100],
    ["single-thread", 50, 8, 140],
    ["wind-down", 55, 10, 160],
    ["sunrise", 74, 3, 60],
    ["reset-your-mind", 79, 5, 100],
    ["name-it", 98, 6, 110],
    ["evening-reflection", 103, 7, 120],
    ["ground", 122, 5, 100],
    ["unclench", 127, 4, 80],
    ["single-thread", 146, 8, 140],
    ["wind-down", 151, 10, 160],
    ["reset-your-mind", 170, 5, 100],
    ["sunrise", 175, 3, 60],
    ["evening-reflection", 194, 7, 120],
    ["ground", 218, 5, 100],
    ["name-it", 242, 6, 110],
  ];
  const titles: Record<string, string> = {
    "reset-your-mind": "Reset Your Mind",
    unclench: "Unclench",
    "single-thread": "Single Thread",
    "wind-down": "Wind Down",
    sunrise: "Sunrise",
    "name-it": "Name It",
    "evening-reflection": "Evening Reflection",
    ground: "Ground",
  };
  const kinds: Record<string, Activity["kind"]> = {
    "reset-your-mind": "breath",
    unclench: "body",
    "single-thread": "focus",
    "wind-down": "sleep",
    sunrise: "breath",
    "name-it": "reflect",
    "evening-reflection": "reflect",
    ground: "body",
  };
  const activities: Activity[] = plan.map(([sessionId, h, minutes, xp], i) => ({
    id: `a${i + 1}`,
    sessionId,
    title: titles[sessionId],
    kind: kinds[sessionId],
    minutes,
    xp,
    at: hoursAgo(h),
    streakAtTime: Math.max(1, 5 - Math.floor(h / 24)),
  }));

  return {
    profile: emptyState.profile,
    xp: 1240,
    streak: 5,
    activities,
    checkIns,
    tasks: [
      { id: "t1", label: "Mindfulness", meta: "5 min", done: true },
      { id: "t2", label: "Mood check-in", meta: "Today", done: true },
      { id: "t3", label: "Evening reflection", meta: "Later", done: false },
    ],
    challengeProgress: Object.fromEntries(CHALLENGES.map((c) => [c.id, c.done])),
    feed: seedFeed(),
    seenStories: [],
  };
}

function seedFeed(): FeedPost[] {
  const f = (i: number) => FRIENDS[i];
  return [
    {
      id: "p1",
      author: f(2),
      title: "Wind Down",
      kind: "sleep",
      minutes: 10,
      at: hoursAgo(1.5),
      note: "31 days. Started because I couldn't sleep. Staying because I can.",
      streak: 31,
      kudos: 24,
      kudosByMe: false,
      milestone: "30-day streak",
    },
    {
      id: "p2",
      author: f(0),
      title: "Single Thread",
      kind: "focus",
      minutes: 8,
      at: hoursAgo(4),
      note: "Deadline week. Eight minutes bought me back the whole afternoon.",
      streak: 12,
      kudos: 9,
      kudosByMe: false,
    },
    {
      id: "p3",
      author: f(1),
      title: "Reset Your Mind",
      kind: "breath",
      minutes: 5,
      at: hoursAgo(9),
      streak: 4,
      kudos: 5,
      kudosByMe: true,
    },
    {
      id: "p4",
      author: f(3),
      title: "Sunrise",
      kind: "breath",
      minutes: 3,
      at: hoursAgo(22),
      note: "Three minutes before the kids wake up. It counts.",
      streak: 7,
      kudos: 14,
      kudosByMe: false,
    },
    {
      id: "p5",
      author: f(4),
      title: "Ground",
      kind: "body",
      minutes: 5,
      at: hoursAgo(28),
      streak: 2,
      kudos: 3,
      kudosByMe: false,
    },
  ];
}

/* ───────────────────────── reducer ───────────────────────── */

type Action =
  | { type: "hydrate"; state: AppState }
  | { type: "profile"; patch: Partial<Profile> }
  | { type: "complete"; activity: Activity }
  | { type: "toggleTask"; id: string }
  | { type: "checkIn"; metric: MetricId; value: number }
  | { type: "kudos"; id: string }
  | { type: "post"; post: FeedPost }
  | { type: "seeStory"; id: string }
  | { type: "reset" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "profile":
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case "complete": {
      const session = SESSIONS.find((s) => s.id === action.activity.sessionId);
      const progress = { ...state.challengeProgress };
      // A finished session advances every challenge it plausibly belongs to.
      progress["calm-quest"] = Math.min(7, (progress["calm-quest"] ?? 0) + 1);
      if (session?.goal === "focus") progress["focus-sprint"] = Math.min(5, (progress["focus-sprint"] ?? 0) + 1);
      if (session?.goal === "sleep") progress["sleep-reset"] = Math.min(3, (progress["sleep-reset"] ?? 0) + 1);
      // Finishing a session ticks off the next open item on today's list.
      const firstOpen = state.tasks.findIndex((t) => !t.done);
      return {
        ...state,
        xp: state.xp + action.activity.xp,
        activities: [action.activity, ...state.activities],
        challengeProgress: progress,
        tasks:
          firstOpen === -1
            ? state.tasks
            : state.tasks.map((t, i) => (i === firstOpen ? { ...t, done: true } : t)),
      };
    }

    case "toggleTask":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };

    case "checkIn": {
      const day = isoDay(new Date());
      const rest = state.checkIns.filter((c) => c.day !== day);
      const current =
        state.checkIns.find((c) => c.day === day) ?? { day, mood: 3, calm: 3, energy: 3, sleep: 3 };
      return { ...state, checkIns: [...rest, { ...current, [action.metric]: action.value }].sort((a, b) => a.day.localeCompare(b.day)) };
    }

    case "kudos":
      return {
        ...state,
        feed: state.feed.map((p) =>
          p.id === action.id
            ? { ...p, kudosByMe: !p.kudosByMe, kudos: p.kudos + (p.kudosByMe ? -1 : 1) }
            : p,
        ),
      };

    case "post":
      return { ...state, feed: [action.post, ...state.feed] };

    case "seeStory":
      return { ...state, seenStories: [...new Set([...state.seenStories, action.id])] };

    case "reset":
      return seedState();

    default:
      return state;
  }
}

/* ───────────────────────── context ───────────────────────── */

interface Ctx {
  state: AppState;
  ready: boolean;
  dispatch: (a: Action) => void;
  today: CheckIn | undefined;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next: AppState;
    try {
      const raw = window.localStorage.getItem(KEY);
      next = raw ? { ...seedState(), ...(JSON.parse(raw) as AppState) } : seedState();
    } catch {
      next = seedState();
    }
    dispatch({ type: "hydrate", state: next });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode / quota — the app still works for this session */
    }
  }, [state, ready]);

  const today = useMemo(
    () => state.checkIns.find((c) => c.day === isoDay(new Date())),
    [state.checkIns],
  );

  const value = useMemo(() => ({ state, ready, dispatch, today }), [state, ready, today]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** Convenience: stable callbacks for the most common writes. */
export function useActions() {
  const { dispatch } = useStore();
  return {
    complete: useCallback((activity: Activity) => dispatch({ type: "complete", activity }), [dispatch]),
    toggleTask: useCallback((id: string) => dispatch({ type: "toggleTask", id }), [dispatch]),
    checkIn: useCallback((metric: MetricId, value: number) => dispatch({ type: "checkIn", metric, value }), [dispatch]),
    kudos: useCallback((id: string) => dispatch({ type: "kudos", id }), [dispatch]),
    post: useCallback((post: FeedPost) => dispatch({ type: "post", post }), [dispatch]),
    setProfile: useCallback((patch: Partial<Profile>) => dispatch({ type: "profile", patch }), [dispatch]),
    seeStory: useCallback((id: string) => dispatch({ type: "seeStory", id }), [dispatch]),
  };
}
