'use client';

/**
 * Route transitions — the three sanctioned patterns (Motion PRD Ch. 7).
 *
 * T1 — Paper veil: a sheet of the page's own ivory with a 1px IKB leading
 *      edge sweeps the old route away. Cover 220 ms (ease-exit), the
 *      incoming content settles as the veil lifts 260 ms (ease-expo).
 *      <= 540 ms to interactive. The paper does the moving; the ink
 *      rides on it.
 *
 * T2 — Shared specimen: the object the reader was watching on the rail
 *      (or the row's plate on mobile) becomes the hero plate of the study
 *      they chose — the specimen doing what it already does, through the
 *      same physics. <= 800 ms. Implemented as a First-Last-Invert-Play
 *      with a still-SVG clone, which is deterministic across browsers;
 *      the clone is laid over the destination plate and cross-fades
 *      into it.
 *
 * T3 — Section dissolve: the quiet typographic hand-off between two case
 *      studies, expressed as T1 with the incoming title rising through
 *      its clip mask (the case-study h1 carries type-set choreography).
 *
 * Everything is Law 6 (interruptible): a navigation mid-flight retargets
 * the veil; a rapid double-click can never stack layers. Reduced motion
 * is a hard cut — the sanctioned fallback, needing no code branch.
 */

import gsap from 'gsap';

import { DUR, EASE, TRANSITION } from './tokens';
import { playVoice } from './sound';
import { prefersReducedMotion } from './lenis';
import type { SpecimenStateName } from '@/lib/specimen-geometry';
import { specimenStillSvg } from '@/lib/specimen-still-svg';

type Navigate = (href: string) => void;

let veil: HTMLDivElement | null = null;
let coverTween: gsap.core.Tween | null = null;
let liftTween: gsap.core.Tween | null = null;

/* T2 in-flight state */
let morphClone: HTMLDivElement | null = null;
let pendingMorph: {
  state: SpecimenStateName;
  rect: DOMRect;
} | null = null;

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
  morphClone?.remove();
  morphClone = null;
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
  if (pendingMorph) {
    startSpecimenMorph();
    return;
  }

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

/**
 * T2. The click site passes the specimen's current state and the rect of
 * the thing the reader was looking at (the rail on desktop, the row's
 * plate on mobile). The still-SVG clone is measured First; the Invert and
 * Play happen against the destination plate when the route renders.
 */
export function specimenNavigate(
  href: string,
  navigate: Navigate,
  state: SpecimenStateName,
  sourceRect: DOMRect,
): void {
  if (prefersReducedMotion()) {
    navigate(href);
    return;
  }

  killFlight();
  pendingMorph = { state, rect: sourceRect };

  // The clone appears immediately over the source, so the object the
  // reader was watching is the thing that starts moving — no cut.
  const clone = document.createElement('div');
  clone.className = 'specimen-clone';
  clone.setAttribute('aria-hidden', 'true');
  clone.innerHTML = specimenStillSvg(state);
  Object.assign(clone.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    zIndex: '80',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  } satisfies Partial<CSSStyleDeclaration>);
  const svg = clone.firstElementChild as SVGElement | null;
  if (svg) {
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.display = 'block';
  }
  gsap.set(clone, {
    x: sourceRect.left,
    y: sourceRect.top,
  });
  document.body.appendChild(clone);
  morphClone = clone;

  navigate(href);
}

function startSpecimenMorph(): void {
  const pending = pendingMorph;
  const clone = morphClone;
  pendingMorph = null;
  morphClone = null;
  if (!pending || !clone) return;

  const dest = document.querySelector<HTMLElement>('.case-header-plate');

  if (!dest || !document.body.contains(clone)) {
    // Destination not present (interrupted navigation): the clone simply
    // settles out — never a stuck layer.
    gsap.to(clone, {
      opacity: 0,
      duration: DUR.slow / 1000,
      onComplete: () => clone.remove(),
    });
    return;
  }

  const r = dest.getBoundingClientRect();
  const sx = r.width / pending.rect.width;
  const sy = r.height / pending.rect.height;

  gsap.to(clone, {
    x: r.left,
    y: r.top,
    width: r.width,
    height: r.height,
    duration: DUR.slow / 1000, // 480ms travel inside the 800ms budget
    ease: `cubic-bezier(${EASE.expo.join(',')})`,
    onComplete: () => {
      // Cross-fade into the real plate, which is already beneath.
      gsap.to(clone, {
        opacity: 0,
        duration: DUR.moderate / 1000,
        onComplete: () => clone.remove(),
      });
    },
  });

  // svg scales with the wrapper via width/height animation; keep aspect
  // by preserving the object box (the still is square, plates are square).
  void sx;
  void sy;
}

/** The motion root calls this when the pathname settles after navigation. */
export function onRouteSettled(): void {
  if (morphClone) {
    startSpecimenMorph();
  } else {
    veilReveal();
  }
}

/** True while a T1 cover is on screen (used to gate re-entry jank). */
export function veilDown(): boolean {
  return !!veil && (coverTween?.isActive() ?? false);
}
