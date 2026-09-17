# Zenith

Mobile-first mindfulness web app. Next.js 16 · React 19 · Tailwind v4 · [Motion](https://motion.dev) 13.

```bash
npm install
npm run dev   # http://localhost:3000
```

Open it at a phone width, or in desktop DevTools device mode — the layout is built
for 375–460px and centres itself in a device frame on larger screens.

## Screens

| Route | What it is |
|---|---|
| `/` | Welcome — counter-rotating orbit hero |
| `/onboarding` | 4 steps: goals, time, motivation, name + reminder |
| `/home` | Greeting, level card, today's quest, daily checklist, wellness check-in |
| `/explore` | Session library with a "for you" rail and goal filters |
| `/circles` | **Community** — stories, leaderboard, feed, share composer |
| `/challenges` | 7-Day Calm Quest + more |
| `/progress` | Practice stats and an animated 7-day wellness chart |
| `/profile` | Identity, level, badges, share-your-streak |
| `/session/[id]` | Breathing player → completion → share |

## The community feature

Strava's share card works because it shows the *shape of the effort* — the map.
A mindfulness session has a shape too: the breath pattern. So every Zenith card
draws a **breath trace** generated from the session's inhale·hold·exhale·rest
timings. A 4-4-4-4 box breath and a 4-2-8-0 wind-down produce visibly different
cards, which is what makes them worth posting.

- **Share composer** (`components/ShareComposer.tsx`) — 3 templates (Story 9:16,
  Post 1:1, Badge 4:5), 4 themes, an optional note, stats toggle.
- **Canvas renderer** (`lib/share-card.ts`) — everything is drawn with the Canvas
  2D API at 1080px wide. No `html2canvas`, no DOM snapshotting, so the export is
  deterministic and the preview is byte-for-byte what gets shared.
- **Export** — `navigator.share({ files })` hands the PNG to the OS share sheet
  where supported, and falls back to a download everywhere else. Nothing leaves
  the device either way.
- **Stories** (`components/StoryViewer.tsx`) — Snapchat-style: segmented
  progress, tap zones, hold to pause. Each story is that friend's own share card,
  drawn by the same renderer — what you post is exactly what your circle sees.
- **Feed** — Strava-style activity cards with *sparks* (kudos), milestone cards,
  and reshare, which opens the composer with that friend's card credited to them.
- **Leaderboard** — minutes practised only. No scores.

## Motion

One vocabulary in `lib/motion.ts`, applied everywhere, following the frequency
rule — the more often something animates, the shorter and quieter it is:

| Token | Duration | Used for |
|---|---|---|
| `micro` | 140ms | taps, toggles, chips |
| `ui` | 260ms | cards, sheets, tab content |
| `route` | 360ms | screen transitions |
| `springy` | spring | sheets, anything the finger moved |
| `pop` | spring, overshoot | level-ups, badge reveals |
| `exit` | 160ms ease-in | every exit — always quieter than the enter |

`prefers-reduced-motion` is honoured globally in `app/globals.css` and per-component
via `useReducedMotion()` on the looping hero and breathing animations.

## Accessibility

44×44px minimum touch targets · primary actions in the bottom thumb zone ·
`env(safe-area-inset-*)` throughout · visible focus rings · `aria-pressed` on every
toggle · SVG icons, no emoji · scrims behind text on gradient surfaces so contrast
holds on the light mint cards.

## State

React context + reducer in `lib/store.tsx`, persisted to `localStorage`
(`zenith.state.v1`) and seeded with three weeks of plausible history so no screen
is ever empty. The server render starts from an empty shell and hydration loads
the real state, so there is no markup mismatch. Profile → *Reset demo data*
restores the seed.

## Design source

Design decisions follow the [`creative-excellence`](https://github.com/AThevon/creative-excellence)
plugin's `mobile-principles`, `motion-principles`, `framer-motion` and
`ui-ux-pro-max` skills.
