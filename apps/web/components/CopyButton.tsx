'use client';

import { useEffect, useRef, useState } from 'react';
import type { LinkEventName } from '@manoj/content/api-types';
import { track } from '@/lib/events';

/**
 * Many desktop visitors have no mail client, so every address on this site
 * is both a link and a copyable string. The label changes to "Copied" for
 * two seconds and is announced politely — it is a confirmation, not an event
 * worth interrupting a screen reader for.
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
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn btn--quiet no-print ${className}`}
      aria-label={`${label} ${value}`}
    >
      <span aria-hidden="true">{copied ? 'Copied' : label}</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? `${value} copied to clipboard` : ''}
      </span>
    </button>
  );
}
