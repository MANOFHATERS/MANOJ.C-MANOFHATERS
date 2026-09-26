# CLAUDE.md — agent instructions

The operating manual for working in this repo. What is being built, the
component inventory and the done-vs-pending ledger live in
[SPEC.md](./SPEC.md) — read it next.

## What this is

Manoj C's portfolio, built as a typographic monograph: a Next.js 16 /
React 19 monorepo where the site, the résumé PDF and the AI guide all
derive from one content package, so they cannot disagree. A Cloudflare
Worker (Hono + Workers AI) serves the guide's hosted mode; Neon Postgres
stores transcripts. Everything else is statically generated.

House rule, enforced everywhere including this repo: **no guessed fact
ships.** Unconfirmed items live in `CONTENT-TODO.md`.

## Repo map

| Path | What it is |
| --- | --- |
| `packages/content/` | Single source of truth: `profile.ts`, `projects.ts`, `resume.ts` (derived), `knowledge.ts` (guide chunks), `search.ts` (BM25, shared by Worker and browser), `scope.ts` (guide refusal rules), `api-types.ts` (site ↔ Worker contract) |
| `apps/web/` | The site, all routes SSG. `app/` (routes, OG, sitemap, robots, llms.txt), `components/home/` (eight sections + hero field-record plate), `components/work/` (case dossier plate), `components/ask/`, `components/motion/`, `components/diagrams/`, `lib/motion/` (tokens, lenis, veil, sound, haptics), `lib/local-guide.ts` (offline guide), `lib/events.ts`, `scripts/build-resume.tsx` |
| `apps/api/` | Cloudflare Worker: Hono routes, retrieval (bge-m3 cosine + BM25 fallback), system prompt, Neurons budget guard, Neon access; `scripts/` (kb embeddings, migrate, evaluate), `migrations/` |
| `CONTENT-TODO.md` | Facts awaiting the owner's confirmation, each naming the file to edit |

## Commands

```bash
npm install            # root; workspaces resolve
npm run dev            # site at localhost:3000
npm run build          # résumé PDF first, then next build (SSG)
npm run typecheck      # tsc --noEmit, web workspace
npm run lint           # next lint
npm run resume         # regenerate the résumé PDF alone
npm run api:dev        # wrangler dev (the Worker)
npm run api:eval       # 60-question guide evaluation — the quality gate
npm run api:migrate    # Neon migrations (needs DATABASE_URL)
npm run api:deploy     # embed KB (kb) then wrangler deploy
```

**Gate for any change:** `typecheck` and `build` pass clean. If the
guide's scope, knowledge or search changed, `api:eval` must also hold —
every refusal intact, ≥95% factual accuracy offline.

## Invariants — do not break

1. **Single source of truth.** Facts live in `packages/content` only.
   Never hardcode a number, name or URL into a component.
2. **No guessed facts.** Unconfirmed items stay in `CONTENT-TODO.md` with
   conservative on-site wording.
3. **Zero WebGL / zero 3D** — removed deliberately; do not reintroduce
   three.js or canvas rendering.
4. **No `§` glyphs** anywhere in rendered output — removed deliberately.
5. **Light-only.** No dark mode; the ivory/ink/IKB system is the identity.
6. **Motion through tokens** — durations, easings and stagger come from
   `lib/motion/tokens.ts` and the CSS `@theme` block; every new animation
   needs a designed `prefers-reduced-motion` tier.
7. **Scope rules before model.** Refusals are classified in `scope.ts`,
   not similarity-scored; the offline guide holds the same bar.
8. **Hydration-safe time.** Clocks render placeholders server-side and
   tick client-side only.
9. **Privacy is structural.** No cookies, no trackers, no raw IPs; a
   visitor is a salted daily-rotating hash.

## Known rough edges

- Monorepo on Vercel: the project's root directory must be set to
  `apps/web` on import. `apps/web/vercel.json` pins the build/install
  commands, clean URLs, immutable static caching and the résumé's
  download disposition.
- The guide's evaluation set (`apps/api/scripts/eval-set.ts`) and the
  FAQ list in `knowledge.ts` drift when scope rules change — update both
  together.
