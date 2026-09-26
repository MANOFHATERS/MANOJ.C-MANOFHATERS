'use client';

/**
 * Haptics — the Android honesty clause (Motion PRD 11.3).
 *
 * navigator.vibrate is Android Chrome only; iOS Safari and Firefox
 * expose no vibration to the web. The design treats that honestly:
 * haptics are progressive enhancement layered onto visual
 * acknowledgment, never load-bearing feedback. Absence on most
 * devices changes nothing.
 *
 * Three patterns: 8 ms on button activation, 16 ms on toggle flips,
 * 24-40-24 triple on copy confirmation. Short, dry, consistent with
 * the sound palette's character.
 */

const PATTERNS = {
  tap: [8] as const,
  toggle: [16] as const,
  copy: [24, 40, 24] as const,
};

export type HapticPattern = keyof typeof PATTERNS;

/** Rapid-fire guard: no pattern stacking within 100 ms (PRD 11.3). */
let lastFire = 0;

export function hapticSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

export function haptic(pattern: HapticPattern): void {
  if (!hapticSupported()) return;
  const now = performance.now();
  if (now - lastFire < 100) return;
  lastFire = now;
  try {
    navigator.vibrate(PATTERNS[pattern] as unknown as number[]);
  } catch {
    /* Vibration is never load-bearing; a refusal is silence. */
  }
}
