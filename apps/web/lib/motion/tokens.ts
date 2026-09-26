/**
 * The motion module — single source of truth for every JS-driven movement.
 *
 * Motion PRD Ch. 12.3: no component imports GSAP directly. Components
 * import this module; this module imports the libraries. The system is
 * auditable in one place, replaceable in one place, testable in one place.
 *
 * The values below mirror the CSS custom properties in globals.css
 * (Motion Token System v1.0). Any discrepancy between the published
 * table and the shipped code is a defect of the highest severity
 * class — a documented system that lies is worse than an
 * undocumented one.
 */

/* ── Durations (ms) — PRD Table 6.1 ──────────────────────────────────── */

export const DUR = {
  /** Toggles, pressed-state flips, cursor state changes. */
  instant: 90,
  /** Hover colour, focus rings, underline draws. */
  quick: 140,
  /** Button fills, arrow swaps, chip states. */
  base: 220,
  /** Card lifts, menu reveals, copy confirmations. */
  moderate: 320,
  /** Section entrances, figure settles. */
  slow: 480,
  /** Hero line rises, pinned beats, rule draws. */
  scenic: 800,
  /** Route veils, specimen morphs. */
  cinematic: 1200,
} as const;

/* ── Easings — PRD Table 6.2 ─────────────────────────────────────────── */

export const EASE = {
  /** Carbon standard: quick start, decisive end. Productive. */
  standard: [0.2, 0, 0.38, 0.9],
  /** Elements arriving: content reveals, panel entries. */
  entrance: [0, 0, 0.3, 1],
  /** Elements leaving: always faster out than in. */
  exit: [0.4, 0, 1, 1],
  /** Sections and figures settling onto the paper. */
  settle: [0.2, 0, 0, 1],
  /** Symmetrical, for lines drawing. */
  draw: [0.65, 0, 0.35, 1],
  /** Long deceleration for large travels and page veils. */
  expo: [0.16, 1, 0.3, 1],
} as const;

/* ── Springs — PRD Table 6.3 (stiffness / damping / mass) ─────────────── */

export const SPRING = {
  /** Button press depth, toggle thumb, pressed cursor scale. */
  tap: { stiffness: 500, damping: 30, mass: 1 },
  /** Cursor dot follow — gsap.quickTo 0.18 s, power3. */
  cursor: { duration: 0.18, ease: 'power3' },
  /** Magnetic hover displacement on primary buttons and rows. */
  magnetic: { duration: 0.4, ease: 'power3' },
  /** Menu overlay link pre-reveals, tooltip drift. */
  peek: { stiffness: 200, damping: 22, mass: 1 },
  /** Specimen drag inertia: velocity carry, friction per frame. */
  fling: { friction: 0.95 },
} as const;

/* ── Stagger laws — PRD 6.4 ──────────────────────────────────────────── */

export const STAGGER = {
  /** Lists of six or fewer items. */
  item: 40,
  /** Typographic line reveals. */
  line: 90,
  /** Total staggering ceiling for any list. */
  cap: 240,
} as const;

/* ── Parallax depth rates — PRD Table 6.4 ─────────────────────────────── */

export const PARALLAX = {
  /** Figure plates within their sections. */
  figure: 0.94,
  /** Section rules, barely perceptible drift. */
  rule: 0.97,
  /** Hard travel ceiling for any single element. */
  capPx: 96,
} as const;

/* ── Transition budgets — PRD Table 7.1 ───────────────────────────────── */

export const TRANSITION = {
  /** T1 paper veil: cover sweep. */
  veilCover: 220,
  /** T1 paper veil: lift, overlapping the incoming settle. */
  veilLift: 260,
  /** T1 total to interactive. */
  veilTotal: 540,
  /** T2 shared specimen morph. */
  specimenMorph: 800,
} as const;

/* ── Latency budgets — PRD Table 9.1 (NN/g) ─────────────────────────── */

export const LATENCY = {
  /** Direct-manipulation feedback: the 0.1-second law. */
  acknowledge: 100,
  /** Hover response must have started. */
  hoverStart: 140,
  /** Route click to veil sweep start. */
  veilStart: 200,
  /** Dwell residence before intent reveals engage. */
  hoverIntent: 120,
  /** Grace period before a reveal may re-trigger. */
  hoverGrace: 200,
} as const;

/**
 * The spring the cursor follows, expressed as GSAP tween parameters.
 * gsap.quickTo with these settings IS the cursor spring token.
 */
export function cursorQuickTo(): { duration: number; ease: string } {
  return { ...SPRING.cursor };
}
