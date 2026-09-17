import type { Challenge, Friend, Goal, Session } from "./types";

export const GOALS: Goal[] = [
  { id: "calm", label: "Stress & Calm", icon: "wind", tint: "mint" },
  { id: "focus", label: "Focus", icon: "target", tint: "violet" },
  { id: "sleep", label: "Better Sleep", icon: "moon", tint: "violet" },
  { id: "mood", label: "Mood", icon: "smile", tint: "amber" },
  { id: "energy", label: "Energy", icon: "bolt", tint: "mint" },
  { id: "habits", label: "Healthy Habits", icon: "pulse", tint: "violet" },
];

export const MOTIVATIONS: { id: string; label: string }[] = [
  { id: "challenges", label: "Completing challenges" },
  { id: "streaks", label: "Building streaks" },
  { id: "rewards", label: "Unlocking rewards" },
  { id: "progress", label: "Tracking progress" },
  { id: "friends", label: "Doing challenges with friends" },
];

export const SESSIONS: Session[] = [
  {
    id: "reset-your-mind",
    title: "Reset Your Mind",
    subtitle: "A short box-breath to clear the noise",
    minutes: 5,
    xp: 100,
    goal: "calm",
    kind: "breath",
    pattern: [4, 4, 4, 4],
    gradient: ["#4A3FB0", "#7B6CF6"],
  },
  {
    id: "unclench",
    title: "Unclench",
    subtitle: "Release the jaw, shoulders, hands",
    minutes: 4,
    xp: 80,
    goal: "calm",
    kind: "body",
    pattern: [4, 2, 6, 0],
    gradient: ["#17B79B", "#2FE3C3"],
  },
  {
    id: "single-thread",
    title: "Single Thread",
    subtitle: "One task, one breath, nothing else",
    minutes: 8,
    xp: 140,
    goal: "focus",
    kind: "focus",
    pattern: [4, 0, 6, 0],
    gradient: ["#3B5BDB", "#7B6CF6"],
  },
  {
    id: "wind-down",
    title: "Wind Down",
    subtitle: "Long exhales to drop your heart rate",
    minutes: 10,
    xp: 160,
    goal: "sleep",
    kind: "sleep",
    pattern: [4, 2, 8, 0],
    gradient: ["#2A2568", "#4A3FB0"],
  },
  {
    id: "sunrise",
    title: "Sunrise",
    subtitle: "Sharp inhales to wake the system up",
    minutes: 3,
    xp: 60,
    goal: "energy",
    kind: "breath",
    pattern: [3, 1, 3, 0],
    gradient: ["#C98A2B", "#F7B84B"],
  },
  {
    id: "name-it",
    title: "Name It",
    subtitle: "Put a word on what you're carrying",
    minutes: 6,
    xp: 110,
    goal: "mood",
    kind: "reflect",
    pattern: [4, 2, 6, 2],
    gradient: ["#A33F63", "#F2718C"],
  },
  {
    id: "evening-reflection",
    title: "Evening Reflection",
    subtitle: "Close the day without carrying it",
    minutes: 7,
    xp: 120,
    goal: "habits",
    kind: "reflect",
    pattern: [4, 4, 6, 2],
    gradient: ["#2A2568", "#7B6CF6"],
  },
  {
    id: "ground",
    title: "Ground",
    subtitle: "Five senses, one at a time",
    minutes: 5,
    xp: 100,
    goal: "calm",
    kind: "body",
    pattern: [5, 0, 5, 0],
    gradient: ["#17B79B", "#3B5BDB"],
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: "calm-quest",
    title: "7-Day Calm Quest",
    blurb: "Build a consistent mindfulness habit.",
    total: 7,
    done: 4,
    reward: "Calm Explorer Badge",
    xp: 500,
    icon: "flag",
  },
  {
    id: "focus-sprint",
    title: "Focus Sprint",
    blurb: "Complete 5 focus sessions this week.",
    total: 5,
    done: 2,
    reward: "Deep Work Badge",
    xp: 300,
    icon: "target",
  },
  {
    id: "sleep-reset",
    title: "Sleep Reset",
    blurb: "Complete 3 evening mindfulness sessions.",
    total: 3,
    done: 1,
    reward: "Night Owl Badge",
    xp: 240,
    icon: "moon",
  },
  {
    id: "weekend-recharge",
    title: "Weekend Recharge",
    blurb: "Practice mindfulness on Saturday and Sunday.",
    total: 2,
    done: 0,
    reward: "Recharge Badge",
    xp: 200,
    icon: "sun",
    locked: true,
  },
];

export const FRIENDS: Friend[] = [
  { id: "f1", name: "Meera", handle: "meera", initials: "M", hue: 168, streak: 12, fresh: true },
  { id: "f2", name: "Dev", handle: "devx", initials: "D", hue: 262, streak: 4, fresh: true },
  { id: "f3", name: "Kabir", handle: "kbr", initials: "K", hue: 38, streak: 31, fresh: true },
  { id: "f4", name: "Sana", handle: "sana", initials: "S", hue: 340, streak: 7, fresh: false },
  { id: "f5", name: "Arjun", handle: "arjn", initials: "A", hue: 200, streak: 2, fresh: false },
];

export const LEVEL_STEP = 200;

export function levelFor(xp: number) {
  const level = Math.floor(xp / LEVEL_STEP) + 1;
  const into = xp % LEVEL_STEP;
  return { level, into, need: LEVEL_STEP, toNext: LEVEL_STEP - into, pct: into / LEVEL_STEP };
}

export function sessionById(id: string) {
  return SESSIONS.find((s) => s.id === id);
}
