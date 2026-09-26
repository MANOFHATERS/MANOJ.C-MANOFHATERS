import type { LinkEventName } from '@manoj/content/api-types';

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? '';

/**
 * Count a link action without a cookie, without a tracker, and without
 * blocking the navigation that caused it.
 *
 * Vercel Web Analytics on Hobby has no custom events, so these go to the
 * Worker with sendBeacon and land in Neon. If the Worker is not configured
 * or the browser refuses the beacon, nothing happens and nothing breaks —
 * an analytics call is never allowed to be load-bearing.
 */
export function track(name: LinkEventName, path?: string): void {
  if (!API_ORIGIN || typeof navigator === 'undefined') return;
  try {
    const body = JSON.stringify({
      name,
      path: path ?? window.location.pathname,
    });
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(
        `${API_ORIGIN}/v1/events`,
        new Blob([body], { type: 'application/json' }),
      );
    }
  } catch {
    /* Analytics must never throw into the click handler. */
  }
}
