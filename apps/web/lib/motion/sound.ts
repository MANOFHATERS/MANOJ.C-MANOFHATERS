'use client';

/**
 * The sound layer — "the quiet instrument" (Motion PRD Ch. 11).
 *
 * Five synthesized voices on the Web Audio API: zero audio files, zero
 * additional bytes, CSP untouched. Dry, woody, precise — closer to a
 * mechanical watch than to a platform UI.
 *
 * Ethics: default-off, persisted, reversible in one click. The toggle
 * itself is the unlocking gesture (the AudioContext user-gesture
 * requirement). Nothing fires without a preceding user action; hidden
 * tabs produce no audio; hover ticks never fire on touch devices.
 */

export type VoiceName = 'tick' | 'click' | 'swipe' | 'settle' | 'confirm';

const STORAGE_KEY = 'sound-enabled';
const MASTER_GAIN = 0.15;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

/** Throttle for hover ticks: one per 200 ms (PRD 11.2). */
let lastTick = 0;

function loadPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Read the persisted preference without enabling anything. */
export function soundPreferred(): boolean {
  return enabled || loadPreference();
}

export function isSoundEnabled(): boolean {
  return enabled;
}

function ensureContext(): boolean {
  if (typeof window === 'undefined') return false;
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume();
    return true;
  }
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return false;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
    return true;
  } catch {
    return false;
  }
}

/**
 * Enable the layer. Must be called from a user gesture (the toggle).
 * Returns the effective state — if the AudioContext could not be
 * created, sound stays off and the toggle says so.
 */
export function enableSound(): boolean {
  enabled = ensureContext();
  if (!enabled) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* Preference persistence is a courtesy, not a requirement. */
  }
  return true;
}

export function disableSound(): void {
  enabled = false;
  try {
    window.localStorage.setItem(STORAGE_KEY, '0');
  } catch {
    /* see above */
  }
  // Destroy the context entirely: the layer is off, not muted (PRD 11.4).
  if (ctx) {
    void ctx.close().catch(() => undefined);
    ctx = null;
    master = null;
  }
}

function gated(): boolean {
  if (!enabled || !ctx || !master) return false;
  if (typeof document !== 'undefined' && document.hidden) return false;
  return true;
}

/* ── Voice synthesis (PRD Table 11.1) ─────────────────────────────────── */

function noiseBuffer(ms: number): AudioBuffer {
  const rate = ctx!.sampleRate;
  const length = Math.max(1, Math.round((ms / 1000) * rate));
  const buffer = ctx!.createBuffer(1, length, rate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** tick — 2 ms noise burst through a 2.2 kHz bandpass, -24 dB. */
function playTick() {
  if (!gated()) return;
  const src = ctx!.createBufferSource();
  src.buffer = noiseBuffer(24);
  const bp = ctx!.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2200;
  bp.Q.value = 8;
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.063, ctx!.currentTime); // -24 dB
  g.gain.exponentialRampToValueAtTime(0.0001, ctx!.currentTime + 0.03);
  src.connect(bp).connect(g).connect(master!);
  src.start();
  src.stop(ctx!.currentTime + 0.05);
}

/** click — 1.5 kHz sine, 40 ms exponential decay, slight detune per press. */
function playClick() {
  if (!gated()) return;
  const osc = ctx!.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 1500 + (Math.random() * 60 - 30);
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.28, ctx!.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx!.currentTime + 0.04);
  osc.connect(g).connect(master!);
  osc.start();
  osc.stop(ctx!.currentTime + 0.06);
}

/** swipe — filtered noise sweep 300→900 Hz over 180 ms, -18 dB. */
function playSwipe() {
  if (!gated()) return;
  const src = ctx!.createBufferSource();
  src.buffer = noiseBuffer(200);
  const bp = ctx!.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(300, ctx!.currentTime);
  bp.frequency.exponentialRampToValueAtTime(900, ctx!.currentTime + 0.18);
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.126, ctx!.currentTime); // -18 dB
  g.gain.exponentialRampToValueAtTime(0.0001, ctx!.currentTime + 0.19);
  src.connect(bp).connect(g).connect(master!);
  src.start();
  src.stop(ctx!.currentTime + 0.22);
}

/** settle — 220 Hz sine fade, 240 ms, only after a state change completes. */
function playSettle() {
  if (!gated()) return;
  const osc = ctx!.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 220;
  const g = ctx!.createGain();
  g.gain.setValueAtTime(0.0001, ctx!.currentTime);
  g.gain.exponentialRampToValueAtTime(0.22, ctx!.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx!.currentTime + 0.24);
  osc.connect(g).connect(master!);
  osc.start();
  osc.stop(ctx!.currentTime + 0.26);
}

/** confirm — two-note E5 then A5, 60 ms apart, triangle wave. */
function playConfirm() {
  if (!gated()) return;
  const note = (freq: number, at: number) => {
    const osc = ctx!.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const g = ctx!.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.25, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
    osc.connect(g).connect(master!);
    osc.start(at);
    osc.stop(at + 0.16);
  };
  const t = ctx!.currentTime;
  note(659.25, t); // E5
  note(880, t + 0.06); // A5
}

const VOICES: Record<VoiceName, () => void> = {
  tick: playTick,
  click: playClick,
  swipe: playSwipe,
  settle: playSettle,
  confirm: playConfirm,
};

/**
 * Play a voice. Every call site is a user action or its direct
 * consequence; this function is the single gate.
 */
export function playVoice(name: VoiceName): void {
  if (!enabled) return;
  if (name === 'tick') {
    // Throttled to one per 200 ms, and never on touch devices.
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }
    const now = performance.now();
    if (now - lastTick < 200) return;
    lastTick = now;
  }
  try {
    VOICES[name]();
  } catch {
    /* A failed voice is silence, never an error. */
  }
}
