'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The counter (Motion PRD 10.4, RFD-09) — numbers count up once from
 * zero on the entrance curve with tabular figures, when the value
 * crosses the reading line; the source column never moves, because a
 * metric without a source is an opinion and this site does not animate
 * opinions.
 *
 * "1st place" counts 0→1 and keeps its suffix; "8.1" counts through its
 * decimals; "Selected" is not a number and stands still, honestly.
 * Reduced motion shows the final value immediately — meaning, never
 * locomotion.
 */

const NUMERIC = /^(?:(\d+)(?:\.(\d+))?)(.*)$/s;

export function Counter({
  value,
  className = '',
  delay = 0,
}: {
  value: string;
  className?: string;
  delay?: number;
}) {
  const match = NUMERIC.exec(value.trim());
  const host = useRef<HTMLSpanElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);

  useEffect(() => {
    if (!match || reduced || !host.current) return;
    const el = host.current;

    const whole = match[1];
    const decimals = match[2]?.length ?? 0;
    const suffix = match[3] ?? '';
    const target = parseFloat(`${whole}.${match[2] ?? '0'}`);

    // The count begins when the value crosses the reading line — not on
    // mount, so a below-the-fold number never wastes its one count.
    let raf = 0;
    let start = 0;
    let started = false;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3.2); // --ease-entrance
    const duration = 800; // --dur-scenic
    let delayStart = 0;

    const frame = (now: number) => {
      if (!started) {
        started = true;
        delayStart = now + delay;
      }
      if (now < delayStart) {
        el.textContent = `0${suffix}`;
        raf = requestAnimationFrame(frame);
        return;
      }
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      const v = target * ease(t);
      el.textContent = `${v.toFixed(decimals)}${suffix}`;
      if (t < 1) raf = requestAnimationFrame(frame);
      else el.textContent = `${target.toFixed(decimals)}${suffix}`;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          raf = requestAnimationFrame(frame);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [match, reduced, delay]);

  if (!match) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span className={`${className} tabular`} ref={host}>
      {value}
    </span>
  );
}
