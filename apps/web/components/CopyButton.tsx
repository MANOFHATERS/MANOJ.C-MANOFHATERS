'use client';

import { useEffect, useRef, useState } from 'react';
import type { LinkEventName } from '@manoj/content/api-types';
import { track } from '@/lib/events';
import { IconCheck, IconCopy } from '@/components/Icons';
import { playVoice } from '@/lib/motion/sound';
import { haptic } from '@/lib/motion/haptics';

/**
 * Many desktop visitors have no mail client, so every address on this site
 * is both a link and a copyable string. The label swaps to a drawn check
 * for two seconds and is announced politely — it is a confirmation, not
 * an event worth interrupting a screen reader for.
 *
 * The motion layer (Motion PRD 8.6) extends the confirmation: the check
 * draws its stroke 180ms behind a 320ms label cross-fade, the confirm
 * voice plays (two-note E5→A5, only if the reader switched sound on),
 * and Android receives the 24-40-24 haptic triple. The label reverts
 * after two seconds, exactly as it always has.
 */
export function CopyButton({
  value,
  label = 'Copy',
  event,
  className = '',
}: {
  value: string;
  label?: string;
  event?: LinkEventName;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older Safari and any non-secure context. Fall back to a selection.
      const el = document.createElement('textarea');
      el.value = value;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {
        /* Nothing more we can do; the address is visible on the page. */
      }
      document.body.removeChild(el);
    }
    if (event) track(event);
    setCopied(true);
    playVoice('confirm');
    haptic('copy');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn btn--quiet no-print ${className}`}
      aria-label={`${label} ${value}`}
      data-cursor={label.toLowerCase() === 'copy' ? 'copy' : 'act'}
    >
      <span className="inline-flex items-center" aria-hidden="true">
        {copied ? (
          <IconCheck size={13} className="check-draw" />
        ) : (
          <IconCopy size={13} />
        )}
        <span className="ml-2">{copied ? 'Copied' : label}</span>
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? `${value} copied to clipboard` : ''}
      </span>
    </button>
  );
}
