'use client';

import { useEffect, useState } from 'react';

/**
 * §01 — the field record.
 *
 * The hero's right-hand instrument. The text column argues; the plate
 * files: what time it is where the work happens, and a short terminal
 * exchange answering the only three questions a hero asks — who, what,
 * and available or not. Everything on the plate is already published
 * elsewhere on the page (availability line, standfirst), so the plate
 * is an instrument reading, not a new claim.
 *
 * The clock is computed client-side in Asia/Kolkata and the server
 * renders a fixed-width placeholder, so hydration never disagrees and
 * the column never shifts. The transcript types one exchange at a time
 * and loops with a long hold; under prefers-reduced-motion it prints
 * the whole transcript statically and the cursor stops blinking. The
 * transcript is aria-hidden — it restates facts a screen reader
 * already meets in DOM order above it.
 */

const TRANSCRIPT = [
  { q: 'whoami', a: 'manoj c' },
  { q: 'role', a: 'full-stack · ml systems' },
  { q: 'base', a: 'bengaluru · 12.97n 77.59e' },
  { q: 'status', a: 'open to internships' },
] as const;

/* Boot after the headline's type-set reveal (830ms worst case) has
   finished, so the plate never competes with the LCP element. */
const BOOT_DELAY = 900;
const TYPE_MS = 44;
const ANSWER_BEAT = 300;
const HOLD_MS = 860;
const LOOP_HOLD = 5600;

type Line = { q: string; a: string };

export function HeroPlate() {
  const [clock, setClock] = useState<{ t: string; d: string } | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [partial, setPartial] = useState('');

  /* The clock: every other readout on the site is minute-accurate;
     this one carries seconds, because a field record is an
     instrument, and an instrument ticks. */
  useEffect(() => {
    const tf = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
    const df = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
    const tick = () => {
      const now = new Date();
      setClock({ t: tf.format(now), d: df.format(now) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* The transcript: types, answers, holds, clears, repeats. Reduced
     motion prints it whole — the information survives, the theatre
     does not. */
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLines([...TRANSCRIPT]);
      return;
    }
    let cancelled = false;
    const pending: Array<{ id: ReturnType<typeof setTimeout>; resolve: () => void }> = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        pending.push({ id: setTimeout(resolve, ms), resolve });
      });

    (async () => {
      await sleep(BOOT_DELAY);
      while (!cancelled) {
        setLines([]);
        for (const line of TRANSCRIPT) {
          for (let i = 1; i <= line.q.length; i += 1) {
            if (cancelled) return;
            setPartial(line.q.slice(0, i));
            await sleep(TYPE_MS);
            if (cancelled) return;
          }
          await sleep(ANSWER_BEAT);
          if (cancelled) return;
          setLines((prev) => [...prev, { q: line.q, a: line.a }]);
          setPartial('');
          await sleep(HOLD_MS);
          if (cancelled) return;
        }
        await sleep(LOOP_HOLD);
      }
    })();

    return () => {
      cancelled = true;
      pending.forEach(({ id, resolve }) => {
        clearTimeout(id);
        resolve();
      });
    };
  }, []);

  return (
    <aside
      aria-label="Bengaluru local time"
      className="hero-plate figure-enter plate-lift border border-[var(--color-rule)] bg-[var(--color-paper-raised)] px-7 py-6"
    >
      {/* Registration marks — the atelier's crop crosses, hairline, at
          the outer corners of the plate. */}
      <span className="reg-mark reg-mark--tl" aria-hidden="true" />
      <span className="reg-mark reg-mark--br" aria-hidden="true" />

      {/* The archive stamp — the same grammar as the case file. */}
      <div className="flex items-baseline justify-between gap-4">
        <span className="micro">Field record</span>
        <span className="mono text-[var(--step-micro)] tracking-[0.06em] text-[var(--color-graphite)]">
          BLR · IN
        </span>
      </div>

      {/* The clock — the site knows what time it is where the work
          happens. Seconds tick; tabular figures hold the column. */}
      <div className="mt-6 border-t border-[var(--color-rule)] pt-6">
        <p
          aria-hidden="true"
          className="mono m-0 text-[clamp(2.2rem,1.5rem+1.3vw,3rem)] font-medium leading-none tracking-[-0.01em] text-[var(--color-ink)]"
        >
          {clock ? clock.t : '--:--:--'}
        </p>
        <p className="micro mt-3 mb-0 text-[var(--text-muted)]">
          Local time · IST — {clock ? clock.d : '—'}
        </p>
      </div>

      {/* The transcript. */}
      <div
        aria-hidden="true"
        className="mono mt-6 border-t border-[var(--color-rule)] pt-6 text-[0.8rem] leading-[1.9] text-[var(--color-ink)]"
      >
        {lines.map((line) => (
          <p key={line.q} className="m-0">
            <span className="text-[var(--text-muted)]">$ </span>
            {line.q}
            <br />
            <span className="pl-[2ch]">{line.a}</span>
          </p>
        ))}
        <p className="m-0">
          <span className="text-[var(--text-muted)]">$ </span>
          {partial}
          <span className="hero-cursor" />
        </p>
      </div>
    </aside>
  );
}
