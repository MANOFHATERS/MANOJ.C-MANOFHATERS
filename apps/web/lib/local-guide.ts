import type { Chunk } from '@manoj/content/knowledge';
import { search, rawVocabulary, termIdf, tokenize } from '@manoj/content/search';
import {
  GREETING_REPLY,
  classifyScope,
  isGreeting,
  replyFor,
} from '@manoj/content/scope';

/**
 * The guide, without the model.
 *
 * When the Worker is not configured or cannot be reached, the panel falls
 * back to this: the same scope rules the Worker applies, the same lexical
 * search over the same chunks, and an answer assembled from the sentences
 * that actually matched.
 *
 * It is extractive by construction. Every word it returns is already printed
 * on this site, so it cannot invent a fact, cannot be argued out of its
 * scope rules, and cannot contradict the page. That is a smaller guide than
 * the hosted one — it cannot rephrase, and it will sometimes answer a
 * neighbouring question — but it is not a less honest one.
 */

export interface LocalAnswer {
  readonly text: string;
  readonly sources: ReadonlyArray<{ id: string; title: string; href: string }>;
  readonly refused: boolean;
}

/** The floor below which the best match is a coincidence rather than an answer. */
const RELEVANCE_FLOOR = 0.16;

/** Split into sentences without breaking on decimals like 0.61 or 2.51. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z"'§])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function answerLocally(question: string): LocalAnswer {
  const q = question.trim();

  if (isGreeting(q)) {
    return { text: GREETING_REPLY, sources: [], refused: false };
  }

  // Scope first, exactly as the Worker does it — so the fallback refuses the
  // same questions the hosted guide refuses, with the same words.
  const scope = classifyScope(q, rawVocabulary);
  if (scope !== 'answerable') {
    return { text: replyFor(scope), sources: [], refused: true };
  }

  const ranked = search(q, 6);
  const best = ranked[0];
  if (!best || best.score < RELEVANCE_FLOOR) {
    return { text: replyFor('off_topic'), sources: [], refused: true };
  }

  // Two or three chunks at most. Reaching further produces an answer stitched
  // from several half-relevant passages, which reads worse than a short one.
  const picked: Chunk[] = [best.chunk];
  for (const r of ranked.slice(1, 3)) {
    if (r.score > best.score * 0.68) picked.push(r.chunk);
  }

  const terms = new Set(tokenize(q));
  const chosen: string[] = [];
  let words = 0;

  const WORD_CAP = 115;

  // The best chunk matched as a whole, so it is quoted as a whole, in reading
  // order, up to the cap. Picking only the sentences that repeat the
  // question's words produces answers that state the problem and omit the
  // solution — the sentence explaining what was done rarely repeats the
  // sentence naming what went wrong.
  for (const sentence of sentences(best.chunk.text)) {
    const w = sentence.split(/\s+/).length;
    if (words + w > WORD_CAP) break;
    chosen.push(sentence);
    words += w;
  }

  // A later chunk earns its place only by covering a query term the answer has
  // not covered yet, and then only with sentences that carry that term. Without
  // that rule a question about TailGen pulls in the frontend-skills chunk,
  // which also says "TailGen" and adds nothing but a dangling clause.
  const covered = new Set(tokenize(best.chunk.text).filter((t) => terms.has(t)));

  for (const chunk of picked.slice(1)) {
    if (words >= WORD_CAP * 0.8) break;

    const chunkTerms = new Set(tokenize(chunk.text).filter((t) => terms.has(t)));
    if ([...chunkTerms].every((t) => covered.has(t))) continue;

    for (const sentence of sentences(chunk.text)) {
      if (chosen.includes(sentence)) continue;
      // Weighted by rarity: a sentence whose only match is "Manoj" is in
      // almost every chunk and answers almost nothing.
      const matched = new Set(tokenize(sentence).filter((t) => terms.has(t)));
      let weight = 0;
      for (const t of matched) weight += termIdf(t);
      if (weight < 1.2) continue;

      const w = sentence.split(/\s+/).length;
      if (words + w > WORD_CAP) break;
      chosen.push(sentence);
      words += w;
    }
    for (const t of chunkTerms) covered.add(t);
  }

  if (chosen.length === 0) chosen.push(sentences(best.chunk.text)[0]);

  return {
    text: chosen.join(' '),
    sources: picked.map((c) => ({
      id: c.id,
      title: `${c.section} ${c.title}`,
      href: c.href,
    })),
    refused: false,
  };
}
