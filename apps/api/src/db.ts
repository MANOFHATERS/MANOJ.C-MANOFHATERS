import { neon } from '@neondatabase/serverless';
import type { Env, Waitable } from './env';

/**
 * Neon, treated as optional.
 *
 * Nothing the visitor can see depends on a write landing. Neon's free tier
 * gives 100 compute-hours a month and each wake-up holds a compute alive for
 * at least five minutes, so writes are buffered per isolate, flushed in
 * batches through ctx.waitUntil, and dropped after one retry. If the database
 * is suspended the chat still answers; it simply stops being logged.
 */

type Sql = ReturnType<typeof neon>;

export function db(env: Env): Sql | null {
  if (!env.DATABASE_URL) return null;
  try {
    return neon(env.DATABASE_URL);
  } catch {
    return null;
  }
}

/* ── Buffered writes ───────────────────────────────────────────────────── */

interface PendingEvent {
  name: string;
  path: string;
  referrerHost: string | null;
}

const eventBuffer: PendingEvent[] = [];
const FLUSH_AT = 12;

export function queueEvent(
  env: Env,
  ctx: Waitable,
  event: PendingEvent,
): void {
  eventBuffer.push(event);
  if (eventBuffer.length < FLUSH_AT) return;
  const batch = eventBuffer.splice(0, eventBuffer.length);
  ctx.waitUntil(flushEvents(env, batch));
}

/** Called from the cron trigger so a quiet isolate does not sit on its buffer. */
export function drainEvents(env: Env, ctx: Waitable): void {
  if (eventBuffer.length === 0) return;
  const batch = eventBuffer.splice(0, eventBuffer.length);
  ctx.waitUntil(flushEvents(env, batch));
}

async function flushEvents(env: Env, batch: PendingEvent[]): Promise<void> {
  const sql = db(env);
  if (!sql) return;
  try {
    await sql`
      insert into link_events (name, path, referrer_host)
      select * from unnest(
        ${batch.map((e) => e.name)}::text[],
        ${batch.map((e) => e.path)}::text[],
        ${batch.map((e) => e.referrerHost)}::text[]
      )
    `;
  } catch {
    // One retry, then the events are gone. An analytics row is not worth a
    // second round trip on a compute budget this tight.
    try {
      await sql`select 1`;
    } catch {
      /* database is asleep or suspended; nothing to do */
    }
  }
}

/* ── Chat logging ──────────────────────────────────────────────────────── */

export interface TurnRecord {
  sessionId: string;
  visitorHash: string;
  country: string | null;
  question: string;
  answer: string;
  offTopic: boolean;
  model: string | null;
  neuronsEst: number;
  sources: string[];
  latencyMs: number;
}

export async function recordTurn(env: Env, turn: TurnRecord): Promise<void> {
  const sql = db(env);
  if (!sql) return;
  try {
    await sql`
      insert into chat_sessions (id, visitor_hash, country, turnstile_ok, message_count)
      values (${turn.sessionId}::uuid, ${turn.visitorHash}, ${turn.country}, true, 1)
      on conflict (id) do update set message_count = chat_sessions.message_count + 1
    `;
    await sql`
      insert into chat_messages (session_id, role, content, off_topic)
      values (${turn.sessionId}::uuid, 'user', ${turn.question.slice(0, 4000)}, ${turn.offTopic})
    `;
    await sql`
      insert into chat_messages
        (session_id, role, content, off_topic, model, neurons_est, sources, latency_ms)
      values (
        ${turn.sessionId}::uuid, 'assistant', ${turn.answer.slice(0, 4000)},
        ${turn.offTopic}, ${turn.model}, ${turn.neuronsEst},
        ${turn.sources}::text[], ${turn.latencyMs}
      )
    `;
  } catch {
    /* Logging is never load-bearing. */
  }
}

export async function recordFeedback(
  env: Env,
  messageId: string,
  rating: 1 | -1,
): Promise<void> {
  const sql = db(env);
  if (!sql) return;
  try {
    await sql`
      insert into chat_feedback (message_id, rating)
      values (${messageId}::bigint, ${rating})
      on conflict (message_id) do update set rating = excluded.rating
    `;
  } catch {
    /* ignored */
  }
}

/* ── Retention ─────────────────────────────────────────────────────────── */

export async function runRetention(env: Env): Promise<void> {
  const sql = db(env);
  if (!sql) return;
  await sql`delete from chat_sessions where created_at < now() - interval '90 days'`;
  await sql`delete from link_events where created_at < now() - interval '13 months'`;
}
