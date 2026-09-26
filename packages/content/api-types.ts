/**
 * The contract between the web app and the Worker.
 *
 * Both sides import these types, so a change to the contract breaks the build
 * rather than production. The Zod schemas that validate at runtime live in the
 * Worker and are derived from the same shapes.
 */

export const CHAT_MESSAGE_MAX = 500;
export const CHAT_BODY_MAX_BYTES = 2048;
export const CHAT_SESSION_MAX_MESSAGES = 40;

export interface ChatRequest {
  readonly sessionId?: string;
  /** 1–500 characters. Longer is rejected with `invalid_input`. */
  readonly message: string;
  /** The path the question was asked from, used for the source chips. */
  readonly page: string;
  readonly turnstileToken?: string;
}

export interface SourceChip {
  readonly id: string;
  readonly title: string;
  readonly href: string;
}

export type ChatStreamEvent =
  | { readonly type: 'meta'; readonly sessionId: string; readonly model: string }
  | { readonly type: 'token'; readonly text: string }
  | { readonly type: 'sources'; readonly items: readonly SourceChip[] }
  | { readonly type: 'done'; readonly messageId: string }
  | {
      readonly type: 'error';
      readonly code: ChatErrorCode;
      readonly message: string;
      readonly retryAfter?: number;
    };

export type ChatErrorCode =
  | 'invalid_input'
  | 'bot_check_failed'
  | 'rate_limited'
  | 'guide_resting'
  | 'ai_unavailable';

export const CHAT_ERROR_COPY: Record<ChatErrorCode, string> = {
  invalid_input: 'That message was empty or too long. Keep it under 500 characters.',
  bot_check_failed: 'The bot check did not pass. Please try again.',
  rate_limited: 'You have asked a lot in a short time. Try again in a few minutes.',
  guide_resting:
    'The guide is resting until 5:30 AM IST. Here are the questions it is asked most.',
  ai_unavailable:
    'The guide is unreachable right now. Here are the questions it is asked most.',
};

/**
 * The fixed replies live in scope.ts, next to the rules that choose between
 * them, and are re-exported here so an API consumer has one import.
 */
export {
  OFF_TOPIC_REPLY,
  PRIVATE_REPLY,
  NOT_ON_SITE_REPLY,
  INJECTION_REPLY,
  replyFor,
  classifyScope,
  type Scope,
} from './scope';

export const OFF_TOPIC_CHIPS = [
  'What did Manoj win with DrugOS?',
  'How can I contact him?',
] as const;

export interface FeedbackRequest {
  readonly messageId: string;
  readonly rating: 1 | -1;
}

export type LinkEventName =
  | 'resume_download'
  | 'email_click'
  | 'email_copy'
  | 'phone_click'
  | 'github_click'
  | 'linkedin_click'
  | 'repo_click'
  | 'chat_open';

export interface LinkEventRequest {
  readonly name: LinkEventName;
  readonly path: string;
}

export interface FaqItem {
  readonly q: string;
  readonly a: string;
  readonly href?: string;
}

export interface HealthResponse {
  readonly ok: boolean;
  readonly ai: boolean;
  readonly db: boolean;
  readonly budgetUsedPct: number;
}
