/**
 * Canvas renderer for shareable cards.
 *
 * Strava's share card works because it shows the *shape of the effort* — the map.
 * A mindfulness session has a shape too: the breath pattern. So every card draws a
 * "breath trace" generated from the session's inhale/hold/exhale/rest timings.
 * Two different sessions produce two visibly different cards.
 *
 * Everything is drawn with the Canvas 2D API — no html2canvas, no DOM snapshotting,
 * so the export is deterministic and pixel-exact at 1080px wide.
 */

export type TemplateId = "story" | "square" | "badge";
export type ThemeId = "aurora" | "mint" | "ember" | "mono";

export interface CardData {
  title: string;
  minutes: number;
  xp: number;
  streak: number;
  handle: string;
  name: string;
  dateLabel: string;
  note?: string;
  pattern: [number, number, number, number];
  milestone?: string;
  showStats: boolean;
}

export const TEMPLATES: { id: TemplateId; label: string; w: number; h: number; ratio: string }[] = [
  { id: "story", label: "Story", w: 1080, h: 1920, ratio: "9:16" },
  { id: "square", label: "Post", w: 1080, h: 1080, ratio: "1:1" },
  { id: "badge", label: "Badge", w: 1080, h: 1350, ratio: "4:5" },
];

interface Theme {
  id: ThemeId;
  label: string;
  bg: [string, string];
  blobA: string;
  blobB: string;
  accent: string;
  accentInk: string;
  ink: string;
  ink2: string;
  card: string;
  hairline: string;
}

export const THEMES: Theme[] = [
  {
    id: "aurora",
    label: "Aurora",
    bg: ["#1B1745", "#090D1A"],
    blobA: "rgba(123,108,246,0.55)",
    blobB: "rgba(47,227,195,0.22)",
    accent: "#2FE3C3",
    accentInk: "#04231E",
    ink: "#FFFFFF",
    ink2: "rgba(255,255,255,0.62)",
    card: "rgba(255,255,255,0.07)",
    hairline: "rgba(255,255,255,0.14)",
  },
  {
    id: "mint",
    label: "Mint",
    bg: ["#06312B", "#04120F"],
    blobA: "rgba(47,227,195,0.42)",
    blobB: "rgba(59,91,219,0.28)",
    accent: "#2FE3C3",
    accentInk: "#04231E",
    ink: "#FFFFFF",
    ink2: "rgba(220,255,248,0.6)",
    card: "rgba(255,255,255,0.07)",
    hairline: "rgba(255,255,255,0.14)",
  },
  {
    id: "ember",
    label: "Ember",
    bg: ["#3A1E08", "#130A04"],
    blobA: "rgba(247,184,75,0.42)",
    blobB: "rgba(242,113,140,0.28)",
    accent: "#F7B84B",
    accentInk: "#2B1704",
    ink: "#FFFFFF",
    ink2: "rgba(255,238,215,0.62)",
    card: "rgba(255,255,255,0.07)",
    hairline: "rgba(255,255,255,0.14)",
  },
  {
    id: "mono",
    label: "Mono",
    bg: ["#16181D", "#08090B"],
    blobA: "rgba(255,255,255,0.12)",
    blobB: "rgba(255,255,255,0.06)",
    accent: "#FFFFFF",
    accentInk: "#0B0D11",
    ink: "#FFFFFF",
    ink2: "rgba(255,255,255,0.55)",
    card: "rgba(255,255,255,0.06)",
    hairline: "rgba(255,255,255,0.16)",
  },
];

export const themeById = (id: ThemeId) => THEMES.find((t) => t.id === id) ?? THEMES[0];
export const templateById = (id: TemplateId) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

/* ───────────────────────── primitives ───────────────────────── */

/** The app's real font, resolved from the DOM so the card matches the UI. */
function fontStack(): string {
  if (typeof window === "undefined") return "sans-serif";
  const resolved = getComputedStyle(document.body).fontFamily;
  return resolved || "system-ui, sans-serif";
}

const f = (weight: number, size: number) => `${weight} ${size}px ${fontStack()}`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

let grainCache: HTMLCanvasElement | null = null;
/** Fine film grain — stops the big gradients from banding on real screens. */
function grain(ctx: CanvasRenderingContext2D, w: number, h: number) {
  if (!grainCache) {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const g = c.getContext("2d");
    if (!g) return;
    const img = g.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 10;
    }
    g.putImageData(img, 0, 0);
    grainCache = c;
  }
  const pattern = ctx.createPattern(grainCache, "repeat");
  if (!pattern) return;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

/** Wrap text to a pixel width, capped at `maxLines` with an ellipsis. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxW && last.length > 1) last = last.slice(0, -1);
    if (last !== lines[maxLines - 1]) lines[maxLines - 1] = last + "…";
  }
  return lines;
}

/**
 * Letter-spaced text, drawn glyph by glyph. `x` is always the left edge — the
 * caller's textAlign is neutralised, because a centred alignment would re-centre
 * every single glyph on its pen position and wreck the spacing.
 */
function tracking(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, px: number) {
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + px;
  }
  ctx.textAlign = prevAlign;
}

function trackedWidth(ctx: CanvasRenderingContext2D, text: string, px: number) {
  return [...text].reduce((w, ch) => w + ctx.measureText(ch).width + px, 0) - px;
}

/** Letter-spaced text centred on `cx`. */
function trackingCentered(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, px: number) {
  tracking(ctx, text, cx - trackedWidth(ctx, text, px) / 2, y, px);
}

/**
 * The breath trace. Each cycle of the pattern becomes one rise-hold-fall-rest
 * segment, so a 4-4-4-4 box breath and a 4-2-8-0 wind-down draw different shapes.
 */
function breathPath(pattern: [number, number, number, number], samples: number): number[] {
  const [inh, hold, exh, rest] = pattern;
  const cycle = Math.max(1, inh + hold + exh + rest);
  const out: number[] = [];
  for (let i = 0; i < samples; i++) {
    // Roughly three cycles across the width, wherever the pattern lands.
    const t = ((i / samples) * cycle * 3) % cycle;
    let v: number;
    if (t < inh) {
      const p = t / Math.max(0.001, inh);
      v = 0.5 - 0.5 * Math.cos(p * Math.PI); // ease in-out rise
    } else if (t < inh + hold) {
      v = 1;
    } else if (t < inh + hold + exh) {
      const p = (t - inh - hold) / Math.max(0.001, exh);
      v = 0.5 + 0.5 * Math.cos(p * Math.PI); // ease in-out fall
    } else {
      v = 0;
    }
    out.push(v);
  }
  return out;
}

function drawBreathTrace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  pattern: [number, number, number, number],
  accent: string,
) {
  const samples = 240;
  const vals = breathPath(pattern, samples);
  const px = (i: number) => x + (i / (samples - 1)) * w;
  const py = (v: number) => y + h - v * h;

  // Soft fill under the curve
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  vals.forEach((v, i) => ctx.lineTo(px(i), py(v)));
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.globalAlpha = 1;

  // The stroke itself, with a glow
  ctx.beginPath();
  vals.forEach((v, i) => (i ? ctx.lineTo(px(i), py(v)) : ctx.moveTo(px(i), py(v))));
  ctx.strokeStyle = accent;
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = accent;
  ctx.shadowBlur = 34;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Peak markers — one dot per held breath
  vals.forEach((v, i) => {
    if (i === 0 || i === samples - 1) return;
    if (v > 0.985 && vals[i - 1] <= 0.985) {
      ctx.beginPath();
      ctx.arc(px(i), py(v), 9, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    }
  });
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, accent: string, ink: string) {
  // Two offset orbit rings and the amber body — the app's mark, drawn to scale.
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = s * 0.055;
  ctx.strokeStyle = accent;
  roundRect(ctx, 0, 0, s * 0.62, s * 0.62, s * 0.31);
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.globalAlpha = 0.45;
  roundRect(ctx, s * 0.36, 0, s * 0.62, s * 0.62, s * 0.31);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(s * 0.67, s * 0.31, s * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#F7B84B";
  ctx.fill();
  ctx.restore();
}

/* ───────────────────────── the card ───────────────────────── */

export function drawCard(
  canvas: HTMLCanvasElement,
  template: TemplateId,
  themeId: ThemeId,
  d: CardData,
) {
  const tpl = templateById(template);
  const t = themeById(themeId);
  const W = tpl.w;
  const H = tpl.h;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const PAD = 84;
  const inner = W - PAD * 2;

  /* Background */
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, t.bg[0]);
  bg.addColorStop(1, t.bg[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  blob(ctx, W * 0.86, H * 0.06, W * 0.85, t.blobA);
  blob(ctx, W * 0.05, H * 0.72, W * 0.75, t.blobB);

  /* Header: mark + wordmark, and the date on the right */
  drawMark(ctx, PAD, PAD, 76, t.accent, t.ink);
  ctx.fillStyle = t.ink;
  ctx.font = f(800, 26);
  tracking(ctx, "ZENITH", PAD + 96, PAD + 44, 9);

  ctx.fillStyle = t.ink2;
  ctx.font = f(700, 24);
  ctx.textAlign = "right";
  ctx.fillText(d.dateLabel.toUpperCase(), W - PAD, PAD + 44);
  ctx.textAlign = "left";

  /* Layout anchors differ per template */
  const isStory = template === "story";
  const isBadge = template === "badge";

  // The badge template is always the medal — that is what picking it means.
  if (isBadge) {
    drawBadgeCard(ctx, {
      W, H, PAD, inner, t,
      d: { ...d, milestone: d.milestone ?? `${d.streak}-day streak` },
    });
    grain(ctx, W, H);
    return;
  }

  /* Layout is bottom-anchored: the footer pins the stats card, the stats card
     pins the trace, and the headline grows upward from the trace. Nothing can
     collide, whatever the title length or whether stats are shown. */

  const footerBase = H - PAD - 14;
  const titleSize = isStory ? 104 : 80;
  const traceH = isStory ? 420 : 150;

  let cursor = footerBase - 74;

  /* ── Stats card ── */
  if (d.showStats) {
    const cardH = isStory ? 186 : 166;
    const cardY = cursor - cardH;
    ctx.fillStyle = t.card;
    roundRect(ctx, PAD, cardY, inner, cardH, 36);
    ctx.fill();
    ctx.strokeStyle = t.hairline;
    ctx.lineWidth = 2;
    ctx.stroke();

    const stats: [string, string][] = [
      ["MINUTES", String(d.minutes)],
      ["XP EARNED", `+${d.xp}`],
      ["DAY STREAK", String(d.streak)],
    ];
    const colW = inner / 3;
    stats.forEach(([label, value], i) => {
      const cx = PAD + colW * i + colW / 2;
      ctx.textAlign = "center";
      ctx.fillStyle = i === 0 ? t.accent : t.ink;
      ctx.font = f(800, isStory ? 62 : 54);
      ctx.fillText(value, cx, cardY + cardH * 0.52);
      ctx.fillStyle = t.ink2;
      ctx.font = f(700, 19);
      trackingCentered(ctx, label, cx, cardY + cardH * 0.75, 5);
      ctx.textAlign = "left";

      if (i < 2) {
        ctx.beginPath();
        ctx.moveTo(PAD + colW * (i + 1), cardY + 38);
        ctx.lineTo(PAD + colW * (i + 1), cardY + cardH - 38);
        ctx.strokeStyle = t.hairline;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    cursor = cardY - 52;
  }

  /* ── Breath trace, with its caption directly beneath ── */
  ctx.font = f(700, 21);
  const captionY = cursor;
  ctx.fillStyle = t.ink2;
  tracking(ctx, "BREATH TRACE", PAD, captionY, 6);
  ctx.textAlign = "right";
  ctx.fillText(`${d.pattern[0]}·${d.pattern[1]}·${d.pattern[2]}·${d.pattern[3]}`, W - PAD, captionY);
  ctx.textAlign = "left";

  const traceY = captionY - 42 - traceH;
  drawBreathTrace(ctx, PAD, traceY, inner, traceH, d.pattern, t.accent);

  /* ── Headline ──
     Story is tall enough for an editorial layout: title under the header, data at
     the foot, the aurora breathing in between. The shorter formats stack the
     headline upward from the trace instead, so nothing ever runs out of room. */
  const eyebrowText = (d.milestone ?? `${d.minutes} MINUTE SESSION`).toUpperCase();
  const titleLh = titleSize * 0.98;

  if (isStory) {
    let ty = PAD + 268;
    ctx.fillStyle = t.accent;
    ctx.font = f(800, 24);
    tracking(ctx, eyebrowText, PAD, ty, 7);
    ty += 40;

    ctx.font = f(800, titleSize);
    ctx.fillStyle = t.ink;
    const lines = wrap(ctx, d.title, inner, 2);
    lines.forEach((ln, i) => ctx.fillText(ln, PAD, ty + titleSize * 0.76 + i * titleLh));
    ty += lines.length * titleLh;

    if (d.note) {
      ctx.font = f(600, 34);
      ctx.fillStyle = t.ink2;
      const noteLines = wrap(ctx, `\u201C${d.note}\u201D`, inner, 3);
      noteLines.forEach((ln, i) => ctx.fillText(ln, PAD, ty + 62 + i * 48));
    }
  } else {
    let y = traceY - 70;

    if (d.note) {
      ctx.font = f(600, 30);
      ctx.fillStyle = t.ink2;
      const noteLines = wrap(ctx, `\u201C${d.note}\u201D`, inner, 2);
      const lh = 42;
      const top = y - noteLines.length * lh;
      noteLines.forEach((ln, i) => ctx.fillText(ln, PAD, top + lh * 0.78 + i * lh));
      y = top - 26;
    }

    ctx.font = f(800, titleSize);
    ctx.fillStyle = t.ink;
    const lines = wrap(ctx, d.title, inner, 2);
    const titleTop = y - lines.length * titleLh;
    lines.forEach((ln, i) => ctx.fillText(ln, PAD, titleTop + titleSize * 0.76 + i * titleLh));

    ctx.fillStyle = t.accent;
    ctx.font = f(800, 24);
    tracking(ctx, eyebrowText, PAD, titleTop - 34, 7);
  }

  /* ── Footer ── */
  ctx.fillStyle = t.ink;
  ctx.font = f(800, 30);
  ctx.fillText(`@${d.handle}`, PAD, H - PAD - 14);
  ctx.fillStyle = t.ink2;
  ctx.font = f(700, 24);
  ctx.textAlign = "right";
  ctx.fillText("zenith.app", W - PAD, H - PAD - 14);
  ctx.textAlign = "left";

  grain(ctx, W, H);
}

/** Milestone cards are a different object: a medal, not an activity log. */
function drawBadgeCard(
  ctx: CanvasRenderingContext2D,
  o: { W: number; H: number; PAD: number; inner: number; t: Theme; d: CardData },
) {
  const { W, H, PAD, inner, t, d } = o;
  const cy = H * 0.44;

  // Concentric rings
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(W / 2, cy, 150 + i * 62, 0, Math.PI * 2);
    ctx.strokeStyle = t.hairline;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 / i;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Medal disc
  const g = ctx.createLinearGradient(W / 2 - 150, cy - 150, W / 2 + 150, cy + 150);
  g.addColorStop(0, t.accent);
  g.addColorStop(1, "#F7B84B");
  ctx.beginPath();
  ctx.arc(W / 2, cy, 150, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.shadowColor = t.accent;
  ctx.shadowBlur = 90;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = t.accentInk;
  ctx.font = f(800, 108);
  ctx.textAlign = "center";
  ctx.fillText(String(d.streak), W / 2, cy + 22);
  ctx.font = f(800, 26);
  trackingCentered(ctx, "DAYS", W / 2, cy + 74, 8);

  ctx.fillStyle = t.accent;
  ctx.font = f(800, 24);
  trackingCentered(ctx, "MILESTONE UNLOCKED", W / 2, cy + 268, 7);

  ctx.fillStyle = t.ink;
  ctx.font = f(800, 76);
  const lines = wrap(ctx, d.milestone ?? "Streak milestone", inner, 2);
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, cy + 358 + i * 78));

  if (d.note) {
    ctx.font = f(600, 32);
    ctx.fillStyle = t.ink2;
    const nl = wrap(ctx, `“${d.note}”`, inner - 60, 2);
    nl.forEach((ln, i) => ctx.fillText(ln, W / 2, cy + 358 + lines.length * 78 + 40 + i * 44));
  }

  ctx.textAlign = "left";
  ctx.fillStyle = t.ink;
  ctx.font = f(800, 30);
  ctx.fillText(`@${d.handle}`, PAD, H - PAD - 14);
  ctx.fillStyle = t.ink2;
  ctx.font = f(700, 24);
  ctx.textAlign = "right";
  ctx.fillText("zenith.app", W - PAD, H - PAD - 14);
  ctx.textAlign = "left";
}

/* ───────────────────────── export ───────────────────────── */

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode the card"))), "image/png", 0.98);
  });
}

export type ShareResult = "shared" | "downloaded" | "cancelled" | "failed";

/**
 * Hands the card to the OS share sheet when the browser supports sharing files,
 * and falls back to a download everywhere else. Nothing leaves the device either way.
 */
export async function shareCard(canvas: HTMLCanvasElement, filename: string, text: string): Promise<ShareResult> {
  let blob: Blob;
  try {
    blob = await canvasToBlob(canvas);
  } catch {
    return "failed";
  }
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
      // Fall through to a download — some browsers advertise share and then refuse.
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "downloaded";
  } catch {
    return "failed";
  }
}
