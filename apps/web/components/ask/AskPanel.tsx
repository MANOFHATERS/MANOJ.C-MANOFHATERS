'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CHAT_MESSAGE_MAX,
  CHAT_ERROR_COPY,
  type ChatErrorCode,
  type SourceChip,
} from '@manoj/content/api-types';
import { faq } from '@manoj/content/knowledge';
import { suggestedQuestions } from '@manoj/content/profile';
import { useAsk } from './AskProvider';
import { API_ORIGIN } from '@/lib/events';
import { answerLocally } from '@/lib/local-guide';

interface Turn {
  id: string;
  role: 'user' | 'guide';
  text: string;
  sources?: readonly SourceChip[];
  streaming?: boolean;
  rating?: 1 | -1;
}

const newId = () => Math.random().toString(36).slice(2, 10);

export function AskPanel() {
  const { open, closeAsk, prefill, consumePrefill } = useAsk();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [degraded, setDegraded] = useState<ChatErrorCode | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string | undefined>(undefined);

  /* Focus moves into the panel on open. */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* Keep focus inside the dialog while it is open. */
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [turns]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || busy) return;
      if (message.length > CHAT_MESSAGE_MAX) return;

      setValue('');
      setBusy(true);
      setDegraded(null);

      const guideId = newId();
      setTurns((t) => [
        ...t,
        { id: newId(), role: 'user', text: message },
        { id: guideId, role: 'guide', text: '', streaming: true },
      ]);

      const patch = (fn: (turn: Turn) => Turn) =>
        setTurns((t) => t.map((turn) => (turn.id === guideId ? fn(turn) : turn)));

      /* The hosted guide, when it is configured. */
      if (API_ORIGIN) {
        try {
          const res = await fetch(`${API_ORIGIN}/v1/chat`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionId.current,
              message,
              page: window.location.pathname,
            }),
          });

          if (!res.ok || !res.body) throw new Error(String(res.status));

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let text = '';

          for (;;) {
            const { done, value: bytes } = await reader.read();
            if (done) break;
            buffer += decoder.decode(bytes, { stream: true });

            const frames = buffer.split('\n\n');
            buffer = frames.pop() ?? '';

            for (const frame of frames) {
              const line = frame.split('\n').find((l) => l.startsWith('data:'));
              if (!line) continue;
              const payload = JSON.parse(line.slice(5).trim());

              if (payload.type === 'meta') sessionId.current = payload.sessionId;
              else if (payload.type === 'token') {
                text += payload.text;
                patch((t) => ({ ...t, text }));
              } else if (payload.type === 'sources') {
                patch((t) => ({ ...t, sources: payload.items }));
              } else if (payload.type === 'error') {
                throw Object.assign(new Error(payload.message), {
                  code: payload.code as ChatErrorCode,
                });
              }
            }
          }

          patch((t) => ({ ...t, streaming: false }));
          setAnnouncement(text);
          setBusy(false);
          return;
        } catch (err) {
          const code = (err as { code?: ChatErrorCode }).code ?? 'ai_unavailable';
          setDegraded(code);
          // Fall through to the local guide rather than showing an error.
        }
      }

      /* The local guide. Extractive, so it cannot invent anything. */
      const answer = answerLocally(message);
      let shown = '';
      const words = answer.text.split(' ');

      for (let i = 0; i < words.length; i++) {
        shown += (i ? ' ' : '') + words[i];
        patch((t) => ({ ...t, text: shown }));
        // Word-by-word, but fast enough that nobody waits for it.
        await new Promise((r) => setTimeout(r, 14));
      }

      patch((t) => ({
        ...t,
        streaming: false,
        sources: answer.sources,
      }));
      setAnnouncement(answer.text);
      setBusy(false);
    },
    [busy],
  );

  /* A question handed in from a page button. */
  useEffect(() => {
    if (open && prefill) {
      const q = prefill;
      consumePrefill();
      void send(q);
    }
  }, [open, prefill, consumePrefill, send]);

  if (!open) return null;

  return (
    <div className="chat-root no-print">
      {/* Scrim. Clicking it closes, which is what people expect. */}
      <button
        type="button"
        aria-label="Close the guide"
        onClick={closeAsk}
        className="fixed inset-0 z-[60] cursor-default bg-[rgba(22,20,15,0.18)] lg:bg-transparent"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-title"
        className="fixed z-[61] flex flex-col border-[var(--color-rule)] bg-[var(--color-paper-raised)]
                   inset-x-0 bottom-0 max-h-[86vh] rounded-t-[2px] border-t
                   sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[26.25rem] sm:rounded-none sm:border-l sm:border-t-0"
        style={{ animation: 'settle-in var(--dur-base) var(--ease-settle) both' }}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-rule)] px-5 py-4">
          <div>
            <h2
              id="ask-title"
              className="font-[family-name:var(--font-serif)] text-[1.2rem] leading-tight"
            >
              Ask Manoj
            </h2>
            <p className="micro mt-1 normal-case tracking-[0.03em]">
              An AI guide to Manoj&rsquo;s work
            </p>
          </div>
          <button
            type="button"
            onClick={closeAsk}
            className="ui text-[var(--step-caption)] ink-link"
          >
            Close
          </button>
        </header>

        {/* Log */}
        <div ref={logRef} className="flex-1 overflow-y-auto px-5 py-5">
          {turns.length === 0 ? (
            <div>
              <p className="prose-measure text-[0.97em] leading-[1.55] text-[var(--color-graphite)]">
                I can answer questions about Manoj — his three systems, how they
                are built, what does not work in them, his education and how to
                reach him. Anything else, I will send you elsewhere.
              </p>
              <ul className="mt-6 flex flex-col gap-2 p-0 m-0 list-none">
                {suggestedQuestions.map((q) => (
                  <li key={q}>
                    <button
                      type="button"
                      onClick={() => void send(q)}
                      className="w-full border border-[var(--color-rule)] px-3 py-2.5 text-left ui text-[var(--step-caption)] transition-colors duration-[var(--dur-quick)] hover:border-[var(--color-ink)]"
                    >
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-6 p-0">
              {turns.map((turn) => (
                <li key={turn.id}>
                  {turn.role === 'user' ? (
                    <p className="ui border-l-2 border-[var(--color-pigment)] pl-3 text-[0.94rem] leading-[1.5] text-[var(--color-ink)]">
                      {turn.text}
                    </p>
                  ) : (
                    <div>
                      <p className="text-[0.99em] leading-[1.6] text-[var(--color-ink)]">
                        {turn.text}
                        {turn.streaming ? (
                          <span
                            className="ml-0.5 inline-block h-[0.95em] w-[1px] translate-y-[0.1em] bg-[var(--color-pigment)]"
                            aria-hidden="true"
                          />
                        ) : null}
                      </p>

                      {turn.sources && turn.sources.length > 0 ? (
                        <ul className="mt-3 flex flex-wrap gap-1.5 p-0 m-0 list-none">
                          {turn.sources.map((s) => (
                            <li key={s.id}>
                              <a
                                href={s.href}
                                onClick={closeAsk}
                                className="mono inline-block border border-[var(--color-rule)] px-2 py-1 text-[0.66rem] text-[var(--color-graphite)] transition-colors duration-[var(--dur-quick)] hover:border-[var(--color-pigment)] hover:text-[var(--color-pigment)]"
                              >
                                {s.title} →
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {!turn.streaming && turn.text ? (
                        <Actions
                          turn={turn}
                          onRate={(rating) =>
                            setTurns((t) =>
                              t.map((x) => (x.id === turn.id ? { ...x, rating } : x)),
                            )
                          }
                        />
                      ) : null}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}

          {degraded ? (
            <div className="mt-8 border-t border-[var(--color-rule)] pt-5">
              <p className="caption">{CHAT_ERROR_COPY[degraded]}</p>
              <ul className="mt-4 flex flex-col gap-1.5 p-0 m-0 list-none">
                {faq.slice(0, 6).map((item) => (
                  <li key={item.q}>
                    <button
                      type="button"
                      onClick={() => void send(item.q)}
                      className="ui text-left text-[var(--step-caption)] ink-link"
                    >
                      {item.q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
        </div>

        {/* Composer */}
        <div className="border-t border-[var(--color-rule)] px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(value);
            }}
          >
            <label htmlFor="ask-input" className="sr-only">
              Ask a question about Manoj
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="ask-input"
                ref={inputRef}
                value={value}
                maxLength={CHAT_MESSAGE_MAX}
                rows={1}
                placeholder="Ask about the work…"
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send(value);
                  }
                }}
                className="ui min-h-[2.75rem] flex-1 resize-none border border-[var(--color-rule)] bg-[var(--color-paper)] px-3 py-2.5 text-[0.94rem] leading-[1.45] text-[var(--color-ink)] outline-none focus-visible:border-[var(--color-pigment)]"
              />
              <button
                type="submit"
                disabled={busy || value.trim().length === 0}
                className="btn btn--pigment disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ask
              </button>
            </div>
          </form>

          <p className="micro mt-3 normal-case tracking-[0.02em] leading-[1.5]">
            AI guide. Answers come from this site&rsquo;s content. It can make
            mistakes; email Manoj to confirm. Transcripts are kept 90 days, then
            deleted.
          </p>
        </div>
      </div>
    </div>
  );
}

function Actions({
  turn,
  onRate,
}: {
  turn: Turn;
  onRate: (rating: 1 | -1) => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(turn.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            /* no clipboard permission; the text is selectable on the page */
          }
        }}
        className="micro normal-case tracking-[0.03em] ink-link"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <button
        type="button"
        onClick={() => onRate(1)}
        aria-pressed={turn.rating === 1}
        aria-label="This answer was helpful"
        className={`micro normal-case tracking-[0.03em] ink-link ${
          turn.rating === 1 ? 'text-[var(--color-signal-ok)]' : ''
        }`}
      >
        Helpful
      </button>
      <button
        type="button"
        onClick={() => onRate(-1)}
        aria-pressed={turn.rating === -1}
        aria-label="This answer was not helpful"
        className={`micro normal-case tracking-[0.03em] ink-link ${
          turn.rating === -1 ? 'text-[var(--color-pigment)]' : ''
        }`}
      >
        Not helpful
      </button>
    </div>
  );
}
