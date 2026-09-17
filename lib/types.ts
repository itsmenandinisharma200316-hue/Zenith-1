export type GoalId = "calm" | "focus" | "sleep" | "mood" | "energy" | "habits";
export type MotivationId = "challenges" | "streaks" | "rewards" | "progress" | "friends";
export type MetricId = "mood" | "calm" | "energy" | "sleep";

export interface Goal {
  id: GoalId;
  label: string;
  icon: string;
  tint: "mint" | "violet" | "amber";
}

export interface Session {
  id: string;
  title: string;
  subtitle: string;
  minutes: number;
  xp: number;
  goal: GoalId;
  kind: "breath" | "body" | "focus" | "sleep" | "reflect";
  /** Seconds per phase: inhale, hold, exhale, rest. Drives the breath player. */
  pattern: [number, number, number, number];
  gradient: [string, string];
}

export interface Challenge {
  id: string;
  title: string;
  blurb: string;
  total: number;
  done: number;
  reward: string;
  xp: number;
  icon: string;
  locked?: boolean;
}

export interface DailyTask {
  id: string;
  label: string;
  meta: string;
  done: boolean;
}

/** One finished session — the unit that becomes a shareable card. */
export interface Activity {
  id: string;
  sessionId: string;
  title: string;
  kind: Session["kind"];
  minutes: number;
  xp: number;
  /** ISO timestamp */
  at: string;
  moodBefore?: number;
  moodAfter?: number;
  note?: string;
  streakAtTime: number;
}

export interface Friend {
  id: string;
  name: string;
  handle: string;
  initials: string;
  hue: number;
  streak: number;
  /** Has an unseen story-style highlight */
  fresh: boolean;
}

export interface FeedPost {
  id: string;
  author: Friend;
  title: string;
  kind: Session["kind"];
  minutes: number;
  at: string;
  note?: string;
  streak: number;
  kudos: number;
  kudosByMe: boolean;
  /** Milestone posts render as a badge card instead of a session card */
  milestone?: string;
}

export interface CheckIn {
  /** ISO date, YYYY-MM-DD */
  day: string;
  mood: number;
  calm: number;
  energy: number;
  sleep: number;
}

export interface Profile {
  name: string;
  handle: string;
  goals: GoalId[];
  minutesPerDay: number;
  motivation: MotivationId | null;
  reminder: string | null;
  onboarded: boolean;
}

export interface AppState {
  profile: Profile;
  xp: number;
  streak: number;
  activities: Activity[];
  checkIns: CheckIn[];
  tasks: DailyTask[];
  challengeProgress: Record<string, number>;
  feed: FeedPost[];
  seenStories: string[];
}
