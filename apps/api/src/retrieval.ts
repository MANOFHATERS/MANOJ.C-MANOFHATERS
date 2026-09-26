import { knowledgeBase } from '@manoj/content/knowledge';
import { search, type Scored } from '@manoj/content/search';
import kbVectors from './kb-vectors.json';

/**
 * Retrieval over the site's own content.
 *
 * Two paths, and the Worker uses whichever it has:
 *
 *   1. Cosine similarity over bge-m3 vectors baked into the bundle at build
 *      time. No database round trip on the hot path, so the search is an
 *      inner product over ~120 vectors — well inside the 10 ms CPU limit on
 *      the free plan.
 *
 *   2. Okapi BM25 over the same chunks, from packages/content/search.ts, used
 *      when the vectors were not built or when the embedding call fails at
 *      request time. It is the same code the browser fallback runs, so a
 *      question retrieves the same chunks wherever it is answered.
 */

export type { Scored };

type VectorFile = { readonly model: string; readonly vectors: number[][] };

// Written by scripts/build-kb.ts. The file in the repository is a placeholder
// with an empty `vectors` array, so a clean checkout compiles and runs — it
// simply retrieves lexically until the embeddings have been built.
const vectors: number[][] | null =
  (kbVectors as VectorFile).vectors.length === knowledgeBase.length
    ? (kbVectors as VectorFile).vectors
    : null;

export const hasVectors = () => vectors !== null;

export function cosineSearch(query: number[], k: number): Scored[] {
  if (!vectors) return [];

  let qNorm = 0;
  for (const v of query) qNorm += v * v;
  qNorm = Math.sqrt(qNorm) || 1;

  const scored: Scored[] = vectors.map((vec, i) => {
    let dot = 0;
    let norm = 0;
    for (let d = 0; d < vec.length; d++) {
      dot += vec[d] * query[d];
      norm += vec[d] * vec[d];
    }
    return {
      chunk: knowledgeBase[i],
      score: dot / (qNorm * (Math.sqrt(norm) || 1)),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

export const bm25Search = search;
