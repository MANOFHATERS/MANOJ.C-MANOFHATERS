import { db } from './db';
import type { Env, Waitable } from './env';

/**
 * The Neuron budget guard.
 *
 * Workers AI gives 10,000 Neurons a day on the free plan and resets at 00:00
 * UTC. At 70% of that the guide switches to the cheaper model; at 90% it stops
 * calling a model at all and the site serves its static FAQ with the line
 * "The guide is resting until 5:30 AM IST" — which is 00:00 UTC in Bengaluru.
 *
 * The counter is cached in the isolate for 60 seconds. Neon's compute budget
 * is the tightest free tier in the stack, and waking it once a minute is very
 * different from waking it once a request.
 */

export type BudgetState = 'normal' | 'fallback' | 'resting';

interface Cached {
  used: number;
  at: number;
  day: string;
}

let cache: Cached | null = null;
const CACHE_MS = 60_000;

const today = () => new Date().toISOString().slice(0, 10);

export async function readBudget(env: Env): Promise<{
  state: BudgetState;
  usedPct: number;
}> {
  const day = today();
  const budget = Number(env.DAILY_NEURON_BUDGET) || 10_000;
  const fallbackAt = (Number(env.BUDGET_FALLBACK_PCT) || 70) / 100;
  const restAt = (Number(env.BUDGET_REST_PCT) || 90) / 100;

  if (!cache || cache.day !== day || Date.now() - cache.at > CACHE_MS) {
    const sql = db(env);
    let used = cache?.day === day ? cache.used : 0;
    if (sql) {
      try {
        const rows = (await sql`
          select neurons_est from usage_daily where day = ${day}::date
        `) as Array<{ neurons_est: number }>;
        used = rows[0]?.neurons_est ?? 0;
      } catch {
        // Without the database we cannot know the real figure. Carry the
        // isolate's own estimate rather than assuming zero, which would let a
        // busy day overrun the allocation silently.
      }
    }
    cache = { used, at: Date.now(), day };
  }

  const ratio = cache.used / budget;
  return {
    state: ratio >= restAt ? 'resting' : ratio >= fallbackAt ? 'fallback' : 'normal',
    usedPct: Math.round(ratio * 100),
  };
}

/** Adds this turn's estimate locally at once, and to Neon in the background. */
export function chargeBudget(
  env: Env,
  ctx: Waitable,
  neurons: number,
  offTopic: boolean,
): void {
  const day = today();
  if (cache?.day === day) cache.used += neurons;
  else cache = { used: neurons, at: Date.now(), day };

  const sql = db(env);
  if (!sql) return;

  ctx.waitUntil(
    (async () => {
      try {
        await sql`
          insert into usage_daily (day, neurons_est, chat_turns, off_topic_turns)
          values (${day}::date, ${neurons}, 1, ${offTopic ? 1 : 0})
          on conflict (day) do update set
            neurons_est     = usage_daily.neurons_est + ${neurons},
            chat_turns      = usage_daily.chat_turns + 1,
            off_topic_turns = usage_daily.off_topic_turns + ${offTopic ? 1 : 0}
        `;
      } catch {
        /* The isolate's own count carries on regardless. */
      }
    })(),
  );
}

/**
 * Neurons per turn, estimated from the rates on Cloudflare's pricing page.
 * An estimate is enough: the guard only needs to know when to change gear,
 * and the real figure arrives on the dashboard either way.
 */
export function estimateNeurons(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const rates: Record<string, { in: number; out: number }> = {
    '@cf/google/gemma-4-26b-a4b-it': { in: 0.0035, out: 0.095 },
    '@cf/qwen/qwen3-30b-a3b-fp8': { in: 0.0025, out: 0.06 },
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast': { in: 0.012, out: 0.4 },
    '@cf/baai/bge-m3': { in: 0.0012, out: 0 },
  };
  const r = rates[model] ?? { in: 0.004, out: 0.1 };
  return Math.ceil(inputTokens * r.in + outputTokens * r.out);
}

/** Rough but consistent — roughly four characters to a token for English. */
export const countTokens = (text: string): number => Math.ceil(text.length / 4);
