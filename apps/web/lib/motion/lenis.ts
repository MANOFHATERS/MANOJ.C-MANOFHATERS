'use client';

/**
 * Lenis smooth scroll, integrated with the GSAP ticker per the documented
 * pattern (Motion PRD 10.2): Lenis emits scroll, ScrollTrigger.update
 * consumes it, Lenis's raf rides the GSAP ticker with lag smoothing
 * disabled — one clock for the entire motion stack.
 *
 * Lenis wraps the native scroll, it does not replace it: sticky
 * positioning, anchor links, find-in-page and browser accessibility
 * behaviour keep working, and the reduced-motion path bypasses Lenis
 * entirely so native scrolling is restored for users who asked for
 * less motion.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis: import('lenis').default | null = null;
let started = false;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Idempotent. Mounts the smooth-scroll layer exactly once, on a device
 *  that earned it: not reduced-motion, not saveData. */
export function initSmoothScroll(): void {
  if (started || typeof window === 'undefined') return;
  started = true;

  if (prefersReducedMotion()) return;

  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (conn?.saveData) return;

  gsap.registerPlugin(ScrollTrigger);

  void import('lenis').then(({ default: Lenis }) => {
    lenis = new Lenis({
      // Conservative feel layer, not a behaviour change (PRD 10.2).
      duration: 1.1,
      // anchors: true is the default; the existing in-page § navigation
      // glides instead of jumping.
      anchors: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
  });
}

/** The live instance, for components that need to stop or observe it. */
export function getLenis() {
  return lenis;
}

/**
 * The specimen rail's zone evaluation reads real scroll position; under
 * Lenis that is window.scrollY, which Lenis keeps synced. This helper
 * exists so future code has one place to ask "where are we really?".
 */
export function scrollY(): number {
  return typeof window === 'undefined' ? 0 : window.scrollY;
}
