'use client';

import { useEffect, useState } from 'react';

import { enableSound, disableSound, isSoundEnabled } from '@/lib/motion/sound';
import { haptic } from '@/lib/motion/haptics';
import { track } from '@/lib/events';

/**
 * The sound toggle (Motion PRD 11.1) — a single speaker glyph in the
 * masthead, drawn in the site's 1.5px stroke grammar. Default off;
 * persisted in localStorage; the toggle itself is the unlocking user
 * gesture the Audio API requires. aria-pressed carries the state.
 */
export function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Restore the persisted preference on mount (after hydration, so the
    // server HTML never disagrees with the client).
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (isSoundEnabled()) setOn(true);
  }, [ready]);

  const toggle = () => {
    if (isSoundEnabled()) {
      disableSound();
      setOn(false);
      track('sound_toggle_off');
    } else {
      const ok = enableSound();
      setOn(ok);
      if (ok) track('sound_toggle_on');
      haptic('toggle');
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Sound on' : 'Sound off'}
      title={on ? 'Sound on' : 'Sound off'}
      data-cursor={on ? 'hush' : 'hear'}
      className={`ui text-[var(--step-small)] ink-link ${className}`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        aria-hidden="true"
        focusable="false"
        style={{ display: 'inline-block', verticalAlign: '-2px' }}
      >
        {/* Speaker cone, 1.5px grammar */}
        <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" />
        {on ? (
          <>
            <path d="M16 9.2a4.4 4.4 0 0 1 0 5.6" />
            <path d="M18.6 6.8a8 8 0 0 1 0 10.4" />
          </>
        ) : (
          <>
            <path d="M16.5 9.5l4 5" />
            <path d="M20.5 9.5l-4 5" />
          </>
        )}
      </svg>
    </button>
  );
}
