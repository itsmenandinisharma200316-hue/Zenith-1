import type { SVGProps } from "react";

export type IconName =
  | "home" | "compass" | "flag" | "bars" | "user" | "users"
  | "wind" | "target" | "moon" | "smile" | "bolt" | "pulse" | "sun"
  | "star" | "check" | "play" | "pause" | "arrow-right" | "arrow-left"
  | "arrow-up-right" | "chevron-right" | "calendar" | "sliders" | "trend"
  | "share" | "download" | "spark" | "flame" | "plus" | "x" | "medal"
  | "heart" | "lock" | "camera" | "copy" | "link";

const P: Record<IconName, string> = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  flag: "M5 21V4M5 4h11l-2 3.5L16 11H5",
  bars: "M5 20v-6M12 20V8M19 20v-9",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0",
  users: "M9 12a3.6 3.6 0 1 0 0-7.2A3.6 3.6 0 0 0 9 12ZM2.5 20a6.5 6.5 0 0 1 13 0M16.5 5.2a3.4 3.4 0 0 1 0 6.6M17.5 13.4A6 6 0 0 1 21.5 19",
  wind: "M3 8h9a3 3 0 1 0-3-3M3 12h13a3 3 0 1 1-3 3M3 16h7",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8.5 14c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8M9 9.5h.01M15 9.5h.01",
  bolt: "M13.5 3 5 13.5h6L10.5 21 19 10.5h-6L13.5 3Z",
  pulse: "M3 12h3.5l2-5 3.5 11 2.5-7 1.5 3H21",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2 12h2M20 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5",
  star: "m12 3.5 2.6 5.5 5.9.8-4.3 4.2 1.1 6-5.3-2.9L6.7 20l1.1-6-4.3-4.2 5.9-.8L12 3.5Z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  play: "M7.5 4.8v14.4L19.5 12 7.5 4.8Z",
  pause: "M9 5v14M15 5v14",
  "arrow-right": "M4 12h15m0 0-6-6m6 6-6 6",
  "arrow-left": "M20 12H5m0 0 6-6m-6 6 6 6",
  "arrow-up-right": "M7 17 17 7m0 0H8m9 0v9",
  "chevron-right": "m9 5 7 7-7 7",
  calendar: "M4.5 7.5A2 2 0 0 1 6.5 5.5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11ZM4.5 10h15M8.5 3.5v3M15.5 3.5v3",
  sliders: "M4 8h10M18 8h2M4 16h4M12 16h8M15 5.5v5M8.5 13.5v5",
  trend: "M4 17.5 10 11l3.5 3.5L20 7M20 7h-5m5 0v5",
  share: "M12 16V4m0 0L8 8m4-4 4 4M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14",
  download: "M12 4v12m0 0 4-4m-4 4-4-4M5 20h14",
  spark: "M12 3.5 13.7 9l5.3 1.8L13.7 12.6 12 18l-1.7-5.4L5 10.8 10.3 9 12 3.5ZM19 4v3M17.5 5.5h3",
  flame: "M12 21c3.6 0 6-2.3 6-5.5 0-4.2-4.2-5.9-4-11-2.6 1.3-4 4-4 6 0 1-.6 1.6-1.3 1.6-.8 0-1.2-.6-1.4-1.6C6.1 12 6 13.3 6 15.5 6 18.7 8.4 21 12 21Z",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  medal: "M12 15.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8.5 14.8 7 21l5-2.2L17 21l-1.5-6.2M8 3h8l-1.5 3.8M8 3l1.5 3.8",
  heart: "M12 20s-7.5-4.4-7.5-9.3A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7.5 2.5C19.5 15.6 12 20 12 20Z",
  lock: "M6.5 10.5h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1ZM8.5 10.5V7.8a3.5 3.5 0 1 1 7 0v2.7",
  camera: "M4 8.5h3l1.5-2.5h7L17 8.5h3a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  copy: "M9 9h9.5a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1ZM5 15H5.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1H15a1 1 0 0 1 1 1v.5",
  link: "M10 13.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.54 3.54 0 0 0-5-5L11 7.5M14 10.5a3.5 3.5 0 0 0-5 0L6.5 13a3.54 3.54 0 0 0 5 5l1.5-1.5",
};

interface Props extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  /** Icons are decorative by default; pass a label to expose one to AT. */
  label?: string;
}

export function Icon({ name, size = 22, label, strokeWidth = 1.7, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      {...rest}
    >
      <path d={P[name]} />
    </svg>
  );
}

/** The Zenith mark: two offset orbits with a single bright body on the path. */
export function Logo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={(size * 26) / 40} viewBox="0 0 40 26" fill="none" className={className} aria-hidden>
      <rect x="1" y="1" width="24" height="24" rx="12" stroke="#2FE3C3" strokeWidth="1.6" />
      <rect x="15" y="1" width="24" height="24" rx="12" stroke="#7B6CF6" strokeWidth="1.6" opacity="0.75" />
      <circle cx="26" cy="13" r="7" fill="#F7B84B" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ letterSpacing: "0.34em", fontWeight: 700 }}>
      ZENITH
    </span>
  );
}
