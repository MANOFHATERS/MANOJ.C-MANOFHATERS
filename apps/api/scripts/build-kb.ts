/**
 * Embeds the knowledge base once, at build time, into src/kb-vectors.json.
 *
 * The vectors ship inside the Worker bundle, so answering a question needs no
 * database round trip and no vector store: the search is an inner product
 * over about 120 vectors, which fits comfortably inside the 10 ms CPU limit
 * on the free plan.
 *
 * Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Workers AI read).
 * Without them the script says so and exits 0 — the Worker then falls back to
 * BM25 over the same chunks, which is worse but never unavailable, and which
 * is also what it uses if the embedding call fails at request time.
 */

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { knowledgeBase } from '../../../packages/content/knowledge';

const MODEL = process.env.EMBEDDING_MODEL ?? '@cf/baai/bge-m3';
const OUT = path.join(process.cwd(), 'src', 'kb-vectors.json');
const BATCH = 20;

async function main() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  console.log(`  knowledge base: ${knowledgeBase.length} chunks`);

  if (!account || !token) {
    console.log(
      '  no CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN — skipping embeddings.\n' +
        '  The Worker will retrieve with BM25 instead. Set both and re-run to\n' +
        '  build vectors for semantic retrieval.',
    );
    return;
  }

  const vectors: number[][] = [];

  for (let i = 0; i < knowledgeBase.length; i += BATCH) {
    const batch = knowledgeBase.slice(i, i + BATCH);
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: batch.map((c) => `${c.title}\n${c.text}`),
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Workers AI returned ${res.status}: ${await res.text()}`);
    }

    const json = (await res.json()) as {
      result?: { data?: number[][] };
      errors?: unknown;
    };
    const data = json.result?.data;
    if (!data || data.length !== batch.length) {
      throw new Error(`unexpected embedding response: ${JSON.stringify(json.errors)}`);
    }

    vectors.push(...data);
    process.stdout.write(`  embedded ${vectors.length}/${knowledgeBase.length}\r`);
  }

  writeFileSync(
    OUT,
    JSON.stringify({ model: MODEL, built: new Date().toISOString(), vectors }),
  );

  const kb = (JSON.stringify(vectors).length / 1024).toFixed(0);
  console.log(`\n  vectors → src/kb-vectors.json  ${kb} KB, ${vectors[0].length} dims`);
}

void main().catch((err) => {
  console.error(`\n  ${String(err)}`);
  process.exit(1);
});
