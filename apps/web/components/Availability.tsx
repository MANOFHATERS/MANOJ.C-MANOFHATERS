'use client';

import { useEffect, useState } from 'react';

/**
 * The availability line (PRD Ch. 11.4): mono, dot indicator — ink means
 * unavailable, IKB means available — and the local time in Bengaluru.
 *
 * Time is computed client-side only and rendered after mount, so the server
 * HTML never disagrees with the client (no hydration mismatch) and the
 * build output stays timezone-independent. It reads Asia/Kolkata through
 * Intl, so it is correct for a visitor in any timezone.
 */
export function AvailabilityLine({ tone = 'ink' }: { tone?: 'ink' | 'paper' }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const color = tone === 'paper' ? 'text-[var(--band-secondary)]' : 'text-[var(--text-muted)]';
  const dot = tone === 'paper' ? 'bg-[var(--band-accent)]' : 'bg-[var(--action)]';

  return (
    <p className={`micro ${color} flex items-center gap-2 normal-case tracking-[0.04em]`}>
      <span
        className={`availability-dot inline-block h-[7px] w-[7px] flex-none rounded-full ${dot}`}
        aria-hidden="true"
      />
      <span>
        Open to engineering internships
        <span aria-hidden="true"> · </span>Bengaluru
        {time ? (
          <>
            <span aria-hidden="true"> · </span>
            <span className="tabular">
              {time}
              <span className="sr-only"> local time, India</span>
            </span>
          </>
        ) : null}
      </span>
    </p>
  );
}
