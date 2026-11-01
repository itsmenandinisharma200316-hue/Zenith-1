"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import { SESSIONS } from "./data";
import type { Activity, AppState, CheckIn, FeedPost, MetricId, Profile } from "./types";

export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const initialProfile: Profile = {
  name: "",
  handle: "",
  goals: [],
  minutesPerDay: 5,
  motivation: null,
  reminder: null,
  onboarded: false,
};

function emptyState(): AppState {
  return {
    profile: initialProfile,
    xp: 0,
    streak: 0,
    activities: [],
    checkIns: [],
    tasks: [
      { id: "t1", label: "Mindfulness", meta: "5 min", done: false },
      { id: "t2", label: "Mood check-in", meta: "Today", done: false },
      { id: "t3", label: "Evening reflection", meta: "Later", done: false },
    ],
    challengeProgress: { "calm-quest": 0, "focus-sprint": 0, "sleep-reset": 0, "weekend-recharge": 0 },
    feed: [],
    seenStories: [],
  };
}

function progressFromActivities(activities: Activity[]) {
  const now = Date.now();
  const recent = activities.filter((a) => now - new Date(a.at).getTime() <= 7 * 24 * 60 * 60 * 1000);
  const uniqueDays = new Set(recent.map((a) => isoDay(new Date(a.at))));
  return {
    "calm-quest": Math.min(7, uniqueDays.size),
    "focus-sprint": Math.min(5, recent.filter((a) => a.kind === "focus").length),
    "sleep-reset": Math.min(3, recent.filter((a) => a.kind === "sleep").length),
    "weekend-recharge": 0,
  };
}

function streakFromActivities(activities: Activity[]) {
  const days = new Set(activities.map((a) => isoDay(new Date(a.at))));
  const today = new Date();
  const todayKey = isoDay(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (!days.has(todayKey) && !days.has(isoDay(yesterday))) return 0;
  let count = 0;
  const cursor = new Date(today);
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  while (days.has(isoDay(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

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
      const activities = [action.activity, ...state.activities];
      const progress = progressFromActivities(activities);
      return {
        ...state,
        xp: state.xp + action.activity.xp,
        streak: streakFromActivities(activities),
        activities,
        challengeProgress: progress,
        // A completed session specifically completes the Mindfulness task.
        tasks: state.tasks.map((task) =>
          task.id === "t1" ? { ...task, done: true } : task,
        ),
      };
    }
    case "toggleTask":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)) };
    case "checkIn": {
      const day = isoDay(new Date());
      const rest = state.checkIns.filter((c) => c.day !== day);
      const current = state.checkIns.find((c) => c.day === day) ?? { day, mood: 3, calm: 3, energy: 3, sleep: 3 };
      return {
        ...state,
        checkIns: [...rest, { ...current, [action.metric]: action.value }].sort((a, b) => a.day.localeCompare(b.day)),
        // Saving a mood rating completes today's Mood check-in task.
        tasks: state.tasks.map((task) =>
          task.id === "t2" ? { ...task, done: true } : task,
        ),
      };
    }
    case "kudos":
      return { ...state, feed: state.feed.map((p) => p.id === action.id ? { ...p, kudosByMe: !p.kudosByMe, kudos: p.kudos + (p.kudosByMe ? -1 : 1) } : p) };
    case "post":
      return { ...state, feed: [action.post, ...state.feed] };
    case "seeStory":
      return { ...state, seenStories: [...new Set([...state.seenStories, action.id])] };
    case "reset":
      return emptyState();
    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  ready: boolean;
  userId: string | null;
  dispatch: (a: Action) => void;
  today: CheckIn | undefined;
}

const StoreContext = createContext<Ctx | null>(null);

async function trackEvent(userId: string, eventName: string, properties: Record<string, unknown> = {}) {
  if (!supabase) return;
  const { error } = await supabase.from("app_events").insert({
    user_id: userId,
    event_name: eventName,
    properties,
  });
  if (error) console.error("Zenith analytics event could not be saved:", error.message);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const loadedUser = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let active = true;

    const loadUser = async (id: string, metadata?: Record<string, unknown>) => {
      if (loadedUser.current === id) return;
      loadedUser.current = id;
      setUserId(id);

      const [profileResult, activityResult, checkInResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase.from("activities").select("*").eq("user_id", id).order("completed_at", { ascending: false }),
        supabase.from("check_ins").select("*").eq("user_id", id).order("day", { ascending: true }),
      ]);

      if (!active) return;
      if (profileResult.error) console.error("Profile load failed:", profileResult.error.message);
      if (activityResult.error) console.error("Activity load failed:", activityResult.error.message);
      if (checkInResult.error) console.error("Check-in load failed:", checkInResult.error.message);

      const profileRow = profileResult.data;
      if (!profileRow && !profileResult.error) {
        const displayName = String(metadata?.full_name ?? metadata?.name ?? "");
        const avatarUrl = String(metadata?.avatar_url ?? metadata?.picture ?? "");
        const { error } = await supabase.from("profiles").upsert(
          { id, display_name: displayName, avatar_url: avatarUrl },
          { onConflict: "id" },
        );
        if (error) console.error("Profile creation failed:", error.message);
      }

      const activities: Activity[] = (activityResult.data ?? []).map((row) => ({
        id: String(row.id),
        sessionId: String(row.session_id),
        title: String(row.title),
        kind: row.kind as Activity["kind"],
        minutes: Number(row.minutes ?? 0),
        xp: Number(row.xp ?? 0),
        at: String(row.completed_at),
        streakAtTime: Number(row.streak_at_time ?? 0),
      }));

      const checkIns: CheckIn[] = (checkInResult.data ?? []).map((row) => ({
        day: String(row.day),
        mood: Number(row.mood ?? 3),
        calm: Number(row.calm ?? 3),
        energy: Number(row.energy ?? 3),
        sleep: Number(row.sleep ?? 3),
      }));

      const base = emptyState();
      const p = profileRow ?? {};
      const profile: Profile = {
        name: String(p.display_name ?? metadata?.full_name ?? metadata?.name ?? ""),
        handle: String(p.handle ?? ""),
        goals: Array.isArray(p.goals) ? p.goals : [],
        minutesPerDay: Number(p.minutes_per_day ?? 5),
        motivation: (p.motivation ?? null) as Profile["motivation"],
        reminder: (p.reminder ?? null) as string | null,
        onboarded: Boolean(p.onboarded),
      };
      const todayKey = isoDay(new Date());
      const didMindfulnessToday = activities.some(
        (activity) => isoDay(new Date(activity.at)) === todayKey,
      );
      const didMoodCheckInToday = checkIns.some((checkIn) => checkIn.day === todayKey);

      const nextState: AppState = {
        ...base,
        profile,
        activities,
        checkIns,
        // Rebuild today's completed tasks from saved user records after refresh.
        tasks: base.tasks.map((task) => ({
          ...task,
          done:
            task.id === "t1"
              ? didMindfulnessToday
              : task.id === "t2"
                ? didMoodCheckInToday
                : false,
        })),
        xp: activities.reduce((sum, activity) => sum + activity.xp, 0),
        streak: streakFromActivities(activities),
        challengeProgress: progressFromActivities(activities),
      };
      if (active) {
        dispatch({ type: "hydrate", state: nextState });
        setReady(true);
        void trackEvent(id, "app_opened");
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        loadedUser.current = null;
        setUserId(null);
        dispatch({ type: "hydrate", state: emptyState() });
        setReady(true);
        return;
      }
      if (session?.user) {
        void loadUser(session.user.id, session.user.user_metadata as Record<string, unknown>);
      } else if (event === "INITIAL_SESSION") {
        loadedUser.current = null;
        setUserId(null);
        dispatch({ type: "hydrate", state: emptyState() });
        setReady(true);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Session check failed:", error.message);
      if (data.session?.user) {
        void loadUser(data.session.user.id, data.session.user.user_metadata as Record<string, unknown>);
      } else {
        loadedUser.current = null;
        setUserId(null);
        dispatch({ type: "hydrate", state: emptyState() });
        setReady(true);
      }
    });

    return () => {
      active = false;
      // Clear the dedupe marker so a fresh effect setup can load the user again.
      // This matters when React replays effects during development/strict mode.
      loadedUser.current = null;
      listener.subscription.unsubscribe();
    };
  }, []);

  const today = useMemo(() => state.checkIns.find((c) => c.day === isoDay(new Date())), [state.checkIns]);
  const value = useMemo(() => ({ state, ready, userId, dispatch, today }), [state, ready, userId, today]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export function useActions() {
  const { dispatch, userId, state } = useStore();

  const complete = useCallback((activity: Activity) => {
    dispatch({ type: "complete", activity });
    if (!supabase || !userId) return;
    void (async () => {
      const { error } = await supabase.from("activities").insert({
        user_id: userId,
        session_id: activity.sessionId,
        title: activity.title,
        kind: activity.kind,
        minutes: activity.minutes,
        xp: activity.xp,
        streak_at_time: activity.streakAtTime,
        completed_at: activity.at,
      });
      if (error) {
        console.error("Session could not be saved:", error.message);
        return;
      }
      await trackEvent(userId, "session_completed", {
        session_id: activity.sessionId,
        minutes: activity.minutes,
        xp: activity.xp,
      });
    })();
  }, [dispatch, userId]);

  const checkIn = useCallback((metric: MetricId, value: number) => {
    dispatch({ type: "checkIn", metric, value });
    if (!supabase || !userId) return;
    void (async () => {
      const day = isoDay(new Date());
      const current = state.checkIns.find((entry) => entry.day === day) ?? { day, mood: 3, calm: 3, energy: 3, sleep: 3 };
      const next = { ...current, [metric]: value };
      const { data: existing, error: lookupError } = await supabase
        .from("check_ins")
        .select("id")
        .eq("user_id", userId)
        .eq("day", day)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lookupError) {
        console.error("Check-in lookup failed:", lookupError.message);
        return;
      }
      const result = existing
        ? await supabase.from("check_ins").update({ mood: next.mood, calm: next.calm, energy: next.energy, sleep: next.sleep }).eq("id", existing.id)
        : await supabase.from("check_ins").insert({ user_id: userId, day, mood: next.mood, calm: next.calm, energy: next.energy, sleep: next.sleep });
      if (result.error) {
        console.error("Check-in could not be saved:", result.error.message);
        return;
      }
      await trackEvent(userId, "wellness_check_in", { metric, value, day });
    })();
  }, [dispatch, state.checkIns, userId]);

  const setProfile = useCallback(async (patch: Partial<Profile>) => {
    const next = { ...state.profile, ...patch };
    dispatch({ type: "profile", patch });
    if (!supabase || !userId) return;
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: next.name,
      handle: next.handle,
      goals: next.goals,
      minutes_per_day: next.minutesPerDay,
      motivation: next.motivation,
      reminder: next.reminder,
      onboarded: next.onboarded,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) console.error("Profile could not be saved:", error.message);
    else await trackEvent(userId, "profile_updated", { onboarded: next.onboarded });
  }, [dispatch, state.profile, userId]);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: "toggleTask", id });
    if (userId) void trackEvent(userId, "daily_task_toggled", { task_id: id });
  }, [dispatch, userId]);

  const kudos = useCallback((id: string) => dispatch({ type: "kudos", id }), [dispatch]);
  const post = useCallback((value: FeedPost) => {
    dispatch({ type: "post", post: value });
    if (userId) void trackEvent(userId, "community_post_created", { kind: value.kind });
  }, [dispatch, userId]);
  const seeStory = useCallback((id: string) => dispatch({ type: "seeStory", id }), [dispatch]);

  return { complete, toggleTask, checkIn, kudos, post, setProfile, seeStory };
}
