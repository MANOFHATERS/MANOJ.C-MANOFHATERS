'use client';

/**
 * Route transitions — the sanctioned patterns (Motion PRD Ch. 7).
 *
 * T1 — Paper veil: a sheet of the page's own ivory with a 1px IKB leading
 *      edge sweeps the old route away. Cover 220 ms (ease-exit), the
 *      incoming content settles as the veil lifts 260 ms (ease-expo).
 *      <= 540 ms to interactive. The paper does the moving; the ink
 *      rides on it.
 *
 * T3 — Section dissolve: the quiet typographic hand-off between two case
 *      studies, expressed as T1 with the incoming title rising through
 *      its clip mask (the case-study h1 carries type-set choreography).
 *
 * The former T2 (shared-specimen morph) was removed with the 3D specimen
 * layer, at the client's request. Every navigation is now the paper veil.
 *
 * Everything is Law 6 (interruptible): a navigation mid-flight retargets
 * the veil; a rapid double-click can never stack layers. Reduced motion
 * is a hard cut — the sanctioned fallback, needing no code branch.
 */

import gsap from 'gsap';

import { TRANSITION, EASE } from './tokens';
import { playVoice } from './sound';
import { prefersReducedMotion } from './lenis';

type Navigate = (href: string) => void;

let veil: HTMLDivElement | null = null;
let coverTween: gsap.core.Tween | null = null;
let liftTween: gsap.core.Tween | null = null;

function ensureVeil(): HTMLDivElement {
  if (veil) return veil;
  veil = document.createElement('div');
  veil.className = 'route-veil';
  veil.setAttribute('aria-hidden', 'true');
  document.body.appendChild(veil);
  return veil;
}

function killFlight(): void {
  coverTween?.kill();
  liftTween?.kill();
  coverTween = null;
  liftTween = null;
  if (veil) gsap.set(veil, { scaleY: 0 });
}

/** T1. Call on navigation intent; the router pushes simultaneously. */
export function veilNavigate(href: string, navigate: Navigate): void {
  if (prefersReducedMotion()) {
    navigate(href);
    return;
  }

  killFlight();
  const el = ensureVeil();
  playVoice('swipe');

  // Retarget mid-flight: whatever the veil was doing, it is now fully
  // down, and the new navigation proceeds underneath it.
  gsap.set(el, { transformOrigin: '50% 0%' });
  coverTween = gsap.to(el, {
    scaleY: 1,
    duration: TRANSITION.veilCover / 1000,
    ease: `cubic-bezier(${EASE.exit.join(',')})`,
  });

  navigate(href);
}

/** T1 reveal. Called by the motion root when the pathname has changed. */
export function veilReveal(): void {
  if (prefersReducedMotion() || !veil) return;

  liftTween?.kill();
  const el = veil;
  gsap.set(el, { transformOrigin: '50% 100%' });
  liftTween = gsap.to(el, {
    scaleY: 0,
    duration: TRANSITION.veilLift / 1000,
    ease: `cubic-bezier(${EASE.expo.join(',')})`,
    onComplete: () => {
      playVoice('swipe');
      liftTween = null;
    },
  });
}

/** The motion root calls this when the pathname settles after navigation. */
export function onRouteSettled(): void {
  veilReveal();
}

/** True while a T1 cover is on screen (used to gate re-entry jank). */
export function veilDown(): boolean {
  return !!veil && (coverTween?.isActive() ?? false);
}
