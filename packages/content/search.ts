/**
 * Lexical search over the knowledge base, shared by the Worker and the
 * browser so that a question retrieves the same chunks in both.
 *
 * Okapi BM25 with a light suffix stemmer. The corpus is about 120 short
 * chunks, so the whole search is well under a millisecond and needs no index
 * on disk, no vector store, and no network call — which is what makes it a
 * usable fallback when the embedding call is unavailable or the Neuron
 * budget is tightening.
 */

import { knowledgeBase, type Chunk } from './knowledge';

const STOP = new Set(
  ('a an and are as at be been being but by can could did do does for from had has have he her his how ' +
    'i in into is it its me my of on or our so than that the their them then there these they this to ' +
    'was were what when where which who whom why will with would you your about does')
    .split(' '),
);

/**
 * A deliberately small stemmer. Not Porter — Porter's later steps do more
 * harm than good on a corpus this size, where "provider" and "provides" want
 * to collapse but "rating" and "rate" do not have to.
 */
export function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
  if (w.length > 4 && (w.endsWith('sses') || w.endsWith('shes') || w.endsWith('ches')))
    return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us'))
    w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed') && !w.endsWith('eed')) w = w.slice(0, -2);
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s._-]/g, ' ')
    .split(/\s+/)
    // Interior dots are meaningful (0.85, vercel.app, linkedin.com) but a
    // sentence-final period is punctuation: "old." would never match a query
    // for "old". Strip the edge dots only.
    .map((t) => t.replace(/^\.+|\.+$/g, ''))
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);
}

/**
 * Visitors ask in their own words — "mail id", "mobile number", "college",
 * "where is he from" — which often share no stem with the chunk that answers
 * them, and some questions reduce to nothing but stopwords. BM25 has no
 * synonyms, so the query is rewritten by a small table before it is scored.
 *
 * Two kinds of rule. Widening rules append terms ("mail" also searches
 * "email"); an added term can only add score where it matches, so it cannot
 * manufacture a false hit. Narrowing rules delete conversational filler
 * ("show me", "tell me") — filler words weigh as much as content words under
 * BM25 and actively misroute, because "show" appears in the site's own
 * copy more often than the answer's keywords.
 */
const ALIASES: ReadonlyArray<readonly [RegExp, string]> = [
  // Conversational filler — dropped rather than widened.
  [/\b(show|tell|give) me\b/g, ''],
  [/\bcan you (tell|show|give|help)\b/g, ''],
  // Contact.
  [/\bmail\b/g, 'mail email'],
  [/\bgmail\b/g, 'gmail email'],
  [/\bmobile\b/g, 'mobile phone'],
  [/\b(call|whatsapp) (number|no\.?)\b/g, 'phone'],
  // Education.
  [/\bcollege\b/g, 'college university'],
  [/\bschool\b/g, 'school education'],
  // Age and location.
  [/\bage\b/g, 'age years old'],
  [/\bhow old\b/g, 'years'],
  [/\bbangalore\b/g, 'bengaluru bangalore'],
  [/\bliving\b/g, 'living lives'],
  [/\bstay(s|ing)?\b/g, 'lives'],
  [/\bwhere is he from\b/g, 'bengaluru lives'],
  [/\bwhere'?s (he|manoj) from\b/g, 'bengaluru lives'],
  [/\bwhere does manoj come from\b/g, 'bengaluru lives'],
  [/\bhometown\b/g, 'bengaluru lives'],
  [/\bnative place\b/g, 'bengaluru lives'],
  // Deployments. Scoped to "can I …" questions so that "what database does
  // he use" does not pull the deployment chunk in by the word "use".
  [/\bdeployment\b/g, 'deployed live'],
  [/\bvercel\b/g, 'vercel deployed live'],
  [/\b(can|could) i (try|use|test|demo|visit|see|open)\b/g, 'deployed live use'],
  // Project names as visitors type them.
  [/\btail ?gen\b/g, 'tailgen'],
  [/\btaiglen\b/g, 'tailgen'],
  [/\batmos ?view\b/g, 'atmosview'],
];

function expandAliases(question: string): string {
  let out = question;
  for (const [pattern, replacement] of ALIASES) out = out.replace(pattern, replacement);
  return out;
}

const docTokens: string[][] = knowledgeBase.map((c) =>
  tokenize(`${c.title} ${c.text}`),
);

const df = new Map<string, number>();
for (const doc of docTokens) {
  for (const term of new Set(doc)) df.set(term, (df.get(term) ?? 0) + 1);
}

const N = knowledgeBase.length;
const avgLen = docTokens.reduce((a, d) => a + d.length, 0) / N;

/** Every stem the site actually uses. Used to spot a question about something it does not. */
export const vocabulary: ReadonlySet<string> = new Set(df.keys());

/** Vocabulary of raw (unstemmed) lowercase words, for proper-noun checks. */
export const rawVocabulary: ReadonlySet<string> = new Set(
  knowledgeBase.flatMap((c) =>
    `${c.title} ${c.text}`
      .toLowerCase()
      .replace(/[^a-z0-9\s.+-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean),
  ),
);

function idf(term: string): number {
  const n = df.get(term) ?? 0;
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
}

/**
 * How much a term narrows things down. "Manoj" appears in most chunks and
 * tells you almost nothing; "kurtosis" appears in one and tells you
 * everything. The extractive guide uses this to decide which sentences are
 * actually answering the question and which merely contain a common word.
 */
export const termIdf = idf;

export interface Scored {
  readonly chunk: Chunk;
  readonly score: number;
}

const K1 = 1.4;
const B = 0.72;

/** Scores are normalised to roughly 0–1 so one relevance floor serves both guides. */
export function search(question: string, k = 6): Scored[] {
  const terms = tokenize(expandAliases(question));
  if (terms.length === 0) return [];

  const scored: Scored[] = docTokens.map((doc, i) => {
    if (doc.length === 0) return { chunk: knowledgeBase[i], score: 0 };

    const counts = new Map<string, number>();
    for (const t of doc) counts.set(t, (counts.get(t) ?? 0) + 1);

    let s = 0;
    for (const term of terms) {
      const f = counts.get(term);
      if (!f) continue;
      s += idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * doc.length) / avgLen)));
    }
    return { chunk: knowledgeBase[i], score: s };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((r) => ({
    chunk: r.chunk,
    // A raw BM25 score of 6 or more is a confident match; under 2 is noise.
    score: Math.min(1, r.score / 6),
  }));
}
