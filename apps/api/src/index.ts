import { Hono } from 'hono';
import { z } from 'zod';

import { CHAT_MESSAGE_MAX, type ChatErrorCode } from '@manoj/content/api-types';
import { faq, knowledgeBase } from '@manoj/content/knowledge';
import { rawVocabulary } from '@manoj/content/search';
import {
  GREETING_REPLY,
  classifyScope,
  isGreeting,
  replyFor,
} from '@manoj/content/scope';

import type { Env, Waitable } from './env';
import {
  chargeBudget,
  countTokens,
  estimateNeurons,
  readBudget,
} from './budget';
import { drainEvents, queueEvent, recordFeedback, recordTurn, runRetention } from './db';
import {
  allowedOrigin,
  checkLimit,
  looksAbusive,
  recordAbuse,
  verifyTurnstile,
  visitorHash,
} from './guard';
import { bm25Search, cosineSearch, hasVectors, type Scored } from './retrieval';
import { SYSTEM_PROMPT, buildContext, buildUserMessage, splitSources } from './prompt';

type Ctx = { Bindings: Env };

const app = new Hono<Ctx>();

/* ── CORS ──────────────────────────────────────────────────────────────── */

app.use('*', async (c, next) => {
  const origin = allowedOrigin(c.env, c.req.header('origin') ?? null);

  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: origin ? 204 : 403,
      headers: origin
        ? {
            'access-control-allow-origin': origin,
            'access-control-allow-methods': 'GET,POST,OPTIONS',
            'access-control-allow-headers': 'content-type',
            'access-control-max-age': '86400',
            vary: 'Origin',
          }
        : {},
    });
  }

  await next();

  if (origin) {
    c.res.headers.set('access-control-allow-origin', origin);
    c.res.headers.set('vary', 'Origin');
  }
  c.res.headers.set('x-content-type-options', 'nosniff');
  c.res.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
});

/* ── Schemas ───────────────────────────────────────────────────────────── */

const chatSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(CHAT_MESSAGE_MAX),
  page: z.string().max(200),
  turnstileToken: z.string().max(4000).optional(),
});

const feedbackSchema = z.object({
  messageId: z.string().max(40),
  rating: z.union([z.literal(1), z.literal(-1)]),
});

const eventSchema = z.object({
  name: z.enum([
    'resume_download',
    'email_click',
    'email_copy',
    'phone_click',
    'github_click',
    'linkedin_click',
    'repo_click',
    'chat_open',
    // Motion layer (Motion PRD Appendix B): sound toggle telemetry —
    // enum values only, no migration, same link_events pipeline.
    'sound_toggle_on',
    'sound_toggle_off',
  ]),
  path: z.string().max(200),
});

/* ── Server-sent events ────────────────────────────────────────────────── */

function sse(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function errorStream(code: ChatErrorCode, message: string, retryAfter?: number) {
  return new Response(sse({ type: 'error', code, message, retryAfter }), {
    status: 200, // the stream itself succeeded; the error is in the payload
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
    },
  });
}

/* ── POST /v1/chat ─────────────────────────────────────────────────────── */

app.post('/v1/chat', async (c) => {
  const started = Date.now();

  const raw = await c.req.text();
  if (raw.length > 2048) {
    return errorStream('invalid_input', 'That request was too large.');
  }

  let body: z.infer<typeof chatSchema>;
  try {
    body = chatSchema.parse(JSON.parse(raw));
  } catch {
    return errorStream(
      'invalid_input',
      `Keep the question between 1 and ${CHAT_MESSAGE_MAX} characters.`,
    );
  }

  const hash = await visitorHash(c.env, c.req.raw);

  const limit = checkLimit(hash);
  if (!limit.ok) {
    return errorStream(
      'rate_limited',
      limit.reason === 'blocked'
        ? 'This session is paused for now.'
        : 'You have asked a lot in a short time.',
      limit.retryAfter,
    );
  }

  const turnstileOk = await verifyTurnstile(
    c.env,
    body.turnstileToken,
    c.req.header('cf-connecting-ip') ?? null,
  );
  if (!turnstileOk) {
    return errorStream('bot_check_failed', 'The bot check did not pass.');
  }

  if (looksAbusive(body.message)) {
    const blocked = recordAbuse(hash);
    return errorStream(
      blocked ? 'rate_limited' : 'invalid_input',
      'I am not able to continue that way. I am happy to talk about Manoj’s work.',
      blocked ? 86_400 : undefined,
    );
  }

  const sessionId = body.sessionId ?? crypto.randomUUID();
  const country = (c.req.raw as Request & { cf?: { country?: string } }).cf?.country ?? null;
  // Cosine and BM25 do not live on the same scale, so each carries its own
  // floor and the code uses whichever path actually produced the results.
  const cosineFloor = Number(c.env.RELEVANCE_FLOOR) || 0.35;
  const lexicalFloor = Number(c.env.LEXICAL_FLOOR) || 0.16;

  /* ── Retrieve ─────────────────────────────────────────────────────── */

  let results: Scored[] = [];
  let embedNeurons = 0;
  let usedVectors = false;

  if (hasVectors()) {
    try {
      const embedded = await c.env.AI.run(c.env.EMBEDDING_MODEL, {
        text: [body.message],
      });
      const vector = embedded.data?.[0];
      if (vector) {
        results = cosineSearch(vector, 6);
        usedVectors = results.length > 0;
        embedNeurons = estimateNeurons(
          c.env.EMBEDDING_MODEL,
          countTokens(body.message),
          0,
        );
      }
    } catch {
      // Fall through to BM25 rather than failing the turn.
    }
  }
  if (results.length === 0) results = bm25Search(body.message, 6);

  const best = results[0]?.score ?? 0;
  const floor = usedVectors ? cosineFloor : lexicalFloor;

  /* ── The pre-filter ───────────────────────────────────────────────────
     Scope is decided by rules before anything reaches a model: an attempt to
     rewrite the guide's instructions, a private question, a request to be a
     general assistant, or a question that presupposes something this site has
     never claimed. Only after those does a weak retrieval score count as
     off-topic — measured over the evaluation set, the score alone cannot
     separate "who won the match" from "who is Manoj".

     Everything this branch answers costs no Neurons and reads identically
     every time, which is both why the free allocation lasts the day and why
     a refusal cannot be argued into a different refusal. */
  const greeting = isGreeting(body.message);
  const scope = greeting ? 'answerable' : classifyScope(body.message, rawVocabulary);

  const fixedReply: string | null =
    scope !== 'answerable'
      ? replyFor(scope)
      : greeting
        ? GREETING_REPLY
        : best < floor
          ? replyFor('off_topic')
          : null;

  if (fixedReply !== null) {
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        controller.enqueue(enc.encode(sse({ type: 'meta', sessionId, model: 'none' })));
        controller.enqueue(enc.encode(sse({ type: 'token', text: fixedReply })));
        controller.enqueue(enc.encode(sse({ type: 'done', messageId: crypto.randomUUID() })));
        controller.close();
      },
    });

    chargeBudget(c.env, c.executionCtx, embedNeurons, true);
    c.executionCtx.waitUntil(
      recordTurn(c.env, {
        sessionId,
        visitorHash: hash,
        country,
        question: body.message,
        answer: fixedReply,
        offTopic: true,
        model: null,
        neuronsEst: embedNeurons,
        sources: [],
        latencyMs: Date.now() - started,
      }),
    );

    return new Response(stream, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
      },
    });
  }

  /* ── Budget ───────────────────────────────────────────────────────── */

  const budget = await readBudget(c.env);
  if (budget.state === 'resting') {
    return errorStream(
      'guide_resting',
      'The guide is resting until 5:30 AM IST.',
    );
  }

  const model =
    budget.state === 'fallback' ? c.env.FALLBACK_MODEL : c.env.PRIMARY_MODEL;

  /* ── Generate ─────────────────────────────────────────────────────── */

  const chunks = results.map((r) => r.chunk);
  const userMessage = buildUserMessage(body.message, buildContext(chunks));
  const inputTokens = countTokens(SYSTEM_PROMPT) + countTokens(userMessage);

  let upstream: ReadableStream<Uint8Array>;
  try {
    const result = (await c.env.AI.run(model, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 350,
      temperature: 0.2,
      stream: true,
    })) as unknown as ReadableStream<Uint8Array>;
    upstream = result;
  } catch {
    return errorStream('ai_unavailable', 'The guide is unreachable right now.');
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let answer = '';
  // How much of the answer the client has already been sent. The citation
  // trailer is written by the model at the very end, so anything that looks
  // like the start of one is held back until we know whether it is.
  let sent = 0;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(sse({ type: 'meta', sessionId, model })));

      const reader = upstream.getReader();
      let buffer = '';

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            const line = frame.split('\n').find((l) => l.startsWith('data:'));
            if (!line) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data) as { response?: string };
              if (!parsed.response) continue;
              answer += parsed.response;
              // Drop a finished trailer, then hold back any trailing bracket
              // run that has not closed yet — that is a trailer arriving.
              const visible = answer
                .replace(/\[\[sources:[^\]]*\]\]\s*$/i, '')
                .replace(/\s*\[\[?[^\]]*$/, '');
              if (visible.length > sent) {
                controller.enqueue(
                  encoder.encode(sse({ type: 'token', text: visible.slice(sent) })),
                );
                sent = visible.length;
              }
            } catch {
              /* a partial frame; the next read completes it */
            }
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            sse({
              type: 'error',
              code: 'ai_unavailable',
              message: 'The guide stopped mid-answer.',
            }),
          ),
        );
      }

      const { text, ids } = splitSources(answer);
      const cited = ids
        .map((id) => knowledgeBase.find((k) => k.id === id))
        .filter((k): k is NonNullable<typeof k> => Boolean(k))
        .slice(0, 3);

      const items = (cited.length > 0 ? cited : chunks.slice(0, 2)).map((k) => ({
        id: k.id,
        title: `${k.section} ${k.title}`,
        href: k.href,
      }));

      controller.enqueue(encoder.encode(sse({ type: 'sources', items })));
      const messageId = crypto.randomUUID();
      controller.enqueue(encoder.encode(sse({ type: 'done', messageId })));
      controller.close();

      const neurons =
        embedNeurons + estimateNeurons(model, inputTokens, countTokens(text));
      chargeBudget(c.env, c.executionCtx, neurons, false);
      c.executionCtx.waitUntil(
        recordTurn(c.env, {
          sessionId,
          visitorHash: hash,
          country,
          question: body.message,
          answer: text,
          offTopic: false,
          model,
          neuronsEst: neurons,
          sources: items.map((i) => i.id),
          latencyMs: Date.now() - started,
        }),
      );
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
    },
  });
});

/* ── POST /v1/feedback ─────────────────────────────────────────────────── */

app.post('/v1/feedback', async (c) => {
  let body: z.infer<typeof feedbackSchema>;
  try {
    body = feedbackSchema.parse(await c.req.json());
  } catch {
    return c.json({ code: 'invalid_input' }, 400);
  }
  c.executionCtx.waitUntil(recordFeedback(c.env, body.messageId, body.rating));
  return c.body(null, 204);
});

/* ── POST /v1/events ───────────────────────────────────────────────────── */

app.post('/v1/events', async (c) => {
  let body: z.infer<typeof eventSchema>;
  try {
    body = eventSchema.parse(await c.req.json());
  } catch {
    return c.body(null, 204); // never tell a beacon it failed
  }

  let referrerHost: string | null = null;
  const referrer = c.req.header('referer');
  if (referrer) {
    try {
      referrerHost = new URL(referrer).host;
    } catch {
      referrerHost = null;
    }
  }

  queueEvent(c.env, c.executionCtx, {
    name: body.name,
    path: body.path,
    referrerHost,
  });
  return c.body(null, 204);
});

/* ── GET /v1/faq ───────────────────────────────────────────────────────── */

app.get('/v1/faq', (c) => {
  c.header('cache-control', 'public, max-age=86400');
  return c.json({ items: faq });
});

/* ── GET /v1/health ────────────────────────────────────────────────────── */

app.get('/v1/health', async (c) => {
  const budget = await readBudget(c.env);
  return c.json({
    ok: true,
    ai: Boolean(c.env.AI),
    db: Boolean(c.env.DATABASE_URL),
    vectors: hasVectors(),
    chunks: knowledgeBase.length,
    budgetUsedPct: budget.usedPct,
    state: budget.state,
  });
});

app.notFound((c) => c.json({ code: 'not_found' }, 404));

/* ── Scheduled ─────────────────────────────────────────────────────────── */

export default {
  fetch: app.fetch,

  async scheduled(_event: unknown, env: Env, ctx: Waitable) {
    // Flush whatever this isolate is still holding, then age out old data.
    drainEvents(env, ctx);
    ctx.waitUntil(runRetention(env));
  },
};
