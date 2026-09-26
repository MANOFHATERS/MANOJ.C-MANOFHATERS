'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import { SPRING } from '@/lib/motion/tokens';
import { prefersReducedMotion } from '@/lib/motion/lenis';

/**
 * The cursor (Motion PRD 8.4) — a 6px International Klein Blue dot that
 * follows the pointer on the cursor spring, expanding to a 36px ring with
 * a mono label over interactive regions.
 *
 * Mounts only on pointer-fine, primary-input devices without a
 * reduced-motion preference. Over text, the native caret is untouched —
 * replacing the text caret is an accessibility crime. The entire cost is
 * one transform per frame on one element.
 */

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    setMounted(true);
    document.documentElement.classList.add('motion-cursor');

    const el = dot.current;
    if (!el) return;

    // Two gsap.quickTo channels — this IS the cursor spring token.
    const xTo = gsap.quickTo(el, 'x', {
      duration: SPRING.cursor.duration,
      ease: SPRING.cursor.ease,
    });
    const yTo = gsap.quickTo(el, 'y', {
      duration: SPRING.cursor.duration,
      ease: SPRING.cursor.ease,
    });

    let first = true;
    const onMove = (e: PointerEvent) => {
      if (first) {
        // Arrive exactly once, without a flight from the corner.
        gsap.set(el, { x: e.clientX, y: e.clientY });
        el.style.opacity = '1';
        first = false;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const interactive = t?.closest(
        'a, button, [role="button"], [data-cursor]',
      ) as HTMLElement | null;
      if (interactive) {
        el.dataset.hover = 'true';
        const label =
          interactive.dataset.cursor ??
          (interactive.closest('[data-cursor-label]') as HTMLElement | null)
            ?.dataset.cursorLabel ??
          '';
        el.querySelector('.cursor-label')!.textContent = label;
      } else {
        el.dataset.hover = 'false';
      }
    };

    const onDown = () => {
      el.dataset.press = 'true';
    };
    const onUp = () => {
      el.dataset.press = 'false';
    };
    const onLeave = () => {
      el.style.opacity = '0';
      first = true;
    };
    const onEnter = () => {
      el.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);

    return () => {
      document.documentElement.classList.remove('motion-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div ref={dot} className="cursor-dot" aria-hidden="true" style={{ opacity: 0 }}>
      <span className="cursor-label" />
    </div>
  );
}
