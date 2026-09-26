import type { Env } from './env';

/**
 * Everything between a visitor and a Neuron.
 *
 * The privacy rule shapes all of it: a raw IP address is never stored and
 * never leaves this function. Rate limiting keys on a SHA-256 of the address
 * plus a salt that rotates daily, so the same visitor is a different key
 * tomorrow and cannot be followed across days.
 */

export async function visitorHash(env: Env, request: Request): Promise<string> {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for') ??
    'unknown';
  const salt = env.VISITOR_HASH_SALT ?? 'unsalted-development-only';
  const day = new Date().toISOString().slice(0, 10);

  const data = new TextEncoder().encode(`${ip}|${salt}|${day}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── Rate limiting ─────────────────────────────────────────────────────── */

interface Window {
  minute: number[];
  day: number[];
  abusive: number;
  blockedUntil: number;
}

const windows = new Map<string, Window>();

const PER_MINUTE = 10;
const PER_DAY = 60;

export type LimitVerdict =
  | { ok: true }
  | { ok: false; retryAfter: number; reason: 'rate' | 'blocked' };

export function checkLimit(hash: string): LimitVerdict {
  const now = Date.now();
  const w = windows.get(hash) ?? { minute: [], day: [], abusive: 0, blockedUntil: 0 };

  if (w.blockedUntil > now) {
    return {
      ok: false,
      retryAfter: Math.ceil((w.blockedUntil - now) / 1000),
      reason: 'blocked',
    };
  }

  w.minute = w.minute.filter((t) => now - t < 60_000);
  w.day = w.day.filter((t) => now - t < 86_400_000);

  if (w.minute.length >= PER_MINUTE) {
    windows.set(hash, w);
    return { ok: false, retryAfter: 60, reason: 'rate' };
  }
  if (w.day.length >= PER_DAY) {
    windows.set(hash, w);
    return { ok: false, retryAfter: 3600, reason: 'rate' };
  }

  w.minute.push(now);
  w.day.push(now);
  windows.set(hash, w);

  // The map is per-isolate and isolates are recycled, but a long-lived one
  // should not grow without bound.
  if (windows.size > 5000) {
    for (const [key, value] of windows) {
      if (value.day.length === 0 && value.blockedUntil < now) windows.delete(key);
      if (windows.size <= 2500) break;
    }
  }

  return { ok: true };
}

/** Three abusive messages in a session block that visitor hash for 24 hours. */
export function recordAbuse(hash: string): boolean {
  const now = Date.now();
  const w = windows.get(hash) ?? { minute: [], day: [], abusive: 0, blockedUntil: 0 };
  w.abusive += 1;
  if (w.abusive >= 3) {
    w.blockedUntil = now + 86_400_000;
  }
  windows.set(hash, w);
  return w.blockedUntil > now;
}

/* ── Turnstile ─────────────────────────────────────────────────────────── */

export async function verifyTurnstile(
  env: Env,
  token: string | undefined,
  ip: string | null,
): Promise<boolean> {
  // Not configured means not enforced — the site must work before the secret
  // exists, and the rate limiter is still in front of every request.
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;

  try {
    const body = new FormData();
    body.append('secret', env.TURNSTILE_SECRET);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);

    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    // A Turnstile outage must not take the guide down with it.
    return true;
  }
}

/* ── Abuse detection ───────────────────────────────────────────────────── */

const ABUSE = [
  /\b(fuck|shit|bitch|bastard|cunt)\b/i,
  /\byou('| a)re (stupid|useless|garbage|trash)\b/i,
  /\bkill (yourself|urself)\b/i,
];

export function looksAbusive(message: string): boolean {
  return ABUSE.some((re) => re.test(message));
}

/* ── CORS ──────────────────────────────────────────────────────────────── */

export function allowedOrigin(env: Env, origin: string | null): string | null {
  if (!origin) return null;
  if (origin === env.ALLOWED_ORIGIN) return origin;
  // Vercel preview deployments for this project only — never a bare wildcard.
  if (
    origin.startsWith(env.PREVIEW_ORIGIN_PREFIX) &&
    origin.endsWith(env.PREVIEW_ORIGIN_SUFFIX)
  ) {
    return origin;
  }
  if (origin.startsWith('http://localhost:')) return origin;
  return null;
}
