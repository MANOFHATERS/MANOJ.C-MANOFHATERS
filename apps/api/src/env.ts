/** Everything the background-write helpers need from a request context. */
export interface Waitable {
  waitUntil(promise: Promise<unknown>): void;
}

export interface Env {
  readonly AI: {
    run: (
      model: string,
      input: Record<string, unknown>,
    ) => Promise<{
      response?: string;
      data?: number[][];
      // Streaming responses come back as a ReadableStream when stream: true.
      [key: string]: unknown;
    }>;
  };

  readonly ALLOWED_ORIGIN: string;
  readonly PREVIEW_ORIGIN_PREFIX: string;
  readonly PREVIEW_ORIGIN_SUFFIX: string;

  readonly PRIMARY_MODEL: string;
  readonly FALLBACK_MODEL: string;
  readonly EMBEDDING_MODEL: string;

  readonly DAILY_NEURON_BUDGET: string;
  readonly BUDGET_FALLBACK_PCT: string;
  readonly BUDGET_REST_PCT: string;
  readonly RELEVANCE_FLOOR: string;
  readonly LEXICAL_FLOOR: string;

  readonly DATABASE_URL?: string;
  readonly TURNSTILE_SECRET?: string;
  readonly VISITOR_HASH_SALT?: string;
}
