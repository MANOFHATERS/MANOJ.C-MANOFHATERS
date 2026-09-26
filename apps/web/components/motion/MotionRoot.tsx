'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';

import { initSmoothScroll, prefersReducedMotion } from '@/lib/motion/lenis';
import { veilNavigate, onRouteSettled } from '@/lib/motion/route-veil';
import { playVoice } from '@/lib/motion/sound';
import { SPRING } from '@/lib/motion/tokens';

/**
 * The motion root — one client component that mounts the entire Measured
 * Precision layer (Motion PRD Ch. 12.3). Nothing user-facing ships before
 * the tokens that govern it, and nothing mounts on a device that did not
 * earn it.
 *
 * Owned concerns:
 *   1. Lenis + GSAP single-ticker smooth scroll, with reduced-motion bypass
 *   2. Route-transition delegation — the T1 paper veil on every navigation
 *   3. Magnetic hover on primary buttons (the magnetic spring)
 *   4. Pointer-entry-side underline direction (the intent grammar)
 *   5. Sound voices for button activation and primary-affordance hover
 *
 * Components stay server-rendered; they opt into behaviour with classes
 * and data attributes, which keeps the content package contractually
 * untouched. — the constraint that keeps this a motion upgrade, not a
 * redesign.
 */

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

function shouldIntercept(
  anchor: HTMLAnchorElement,
  event: MouseEvent,
): URL | null {
  if (event.defaultPrevented) return null;
  if (event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return null;
  }
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.hasAttribute('download')) return null;

  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;

  // Same-path links are anchors (or self-links): they glide under Lenis,
  // they never veil. Route changes veil.
  if (url.pathname === window.location.pathname) return null;

  return url;
}

export function MotionRoot() {
  const router = useRouter();
  const pathname = usePathname();
  const navigated = useRef(false);

  /* ── 1. The single ticker ─────────────────────────────────────────── */

  useEffect(() => {
    initSmoothScroll();
  }, []);

  /* ── 2. Route transitions + delegated micro-interactions ───────────── */

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      // Sound: button activation and menu-item selection (PRD Table 11.1).
      const actor = target.closest('button, nav a, [data-voice-click]');
      if (actor) playVoice('click');

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;

      const url = shouldIntercept(anchor, event);
      if (!url) return;

      event.preventDefault();
      navigated.current = true;

      // T1 — the paper veil, the site's signature.
      veilNavigate(url.pathname + url.search + url.hash, (href) =>
        router.push(href),
      );
    };

    document.addEventListener('click', onClick, { passive: false });
    return () => document.removeEventListener('click', onClick);
  }, [router]);

  /* ── 3. Magnetic hover — the magnetic spring (PRD 8.2) ─────────────── */

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let scan: ReturnType<typeof setTimeout> | null = null;

    const attach = () => {
      const els = document.querySelectorAll<HTMLElement>(
        '.btn--pigment, [data-magnetic]',
      );
      els.forEach((el) => {
        if (el.dataset.magInit === '1') return;
        el.dataset.magInit = '1';

        const xTo = gsap.quickTo(el, 'x', {
          duration: SPRING.magnetic.duration,
          ease: SPRING.magnetic.ease,
        });
        const yTo = gsap.quickTo(el, 'y', {
          duration: SPRING.magnetic.duration,
          ease: SPRING.magnetic.ease,
        });

        // The quiet tick on primary-affordance hover (throttled in the
        // sound module; never on touch devices).
        el.addEventListener('pointerenter', () => playVoice('tick'));

        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          // Drift toward the pointer by up to 4 px, then home on leave.
          xTo(clamp(dx * 0.12, -4, 4));
          yTo(clamp(dy * 0.12, -4, 4));
        });
        el.addEventListener('pointerleave', () => {
          xTo(0);
          yTo(0);
        });
      });
    };

    attach();
    // Elements arrive with each route; the observer keeps the registry warm
    // without a per-component useEffect.
    const mo = new MutationObserver(() => {
      if (scan) clearTimeout(scan);
      scan = setTimeout(attach, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (scan) clearTimeout(scan);
    };
  }, []);

  /* ── 4. Pointer-entry-side underlines (PRD 8.3) ────────────────────── */

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const onOver = (event: PointerEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>(
        '.ink-link',
      );
      if (!link) return;
      const r = link.getBoundingClientRect();
      const fromRight = event.clientX - r.left > r.width / 2;
      link.style.setProperty('--enter-x', fromRight ? '100%' : '0%');
    };

    document.addEventListener('pointerover', onOver, { passive: true });
    return () => document.removeEventListener('pointerover', onOver);
  }, []);

  /* ── 5. Route settlement: reveal, refresh, hand focus to the heading ── */

  useEffect(() => {
    onRouteSettled();

    // ScrollTrigger needs to know the new page's length.
    void import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh();
    });

    // Focus moves to the new route's heading on navigation complete
    // (PRD 7.4). Programmatic focus never paints the focus ring
    // (:focus-visible only), and scroll position is preserved.
    if (navigated.current) {
      navigated.current = false;
      requestAnimationFrame(() => {
        const h1 = document.querySelector<HTMLElement>('main h1');
        if (h1) {
          h1.setAttribute('tabindex', '-1');
          h1.focus({ preventScroll: true });
        }
      });
    }
  }, [pathname]);

  return null;
}
