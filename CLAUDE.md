# CLAUDE.md — plan and spec

Read this before changing anything. It says what this repo is, how the
pieces fit, which parts are done, and the rules a change must follow.

---

## What this is

Manoj C's portfolio, built as a typographic monograph. A Next.js 16 /
React 19 monorepo whose entire content — identity, three case studies, the
résumé, the AI guide's knowledge — derives from one content package, so the
site, the PDF and the chatbot cannot disagree with each other. A
Cloudflare Worker (Hono + Workers AI) serves the guide's hosted mode; Neon
Postgres stores its transcripts. Everything else is statically generated.

Thesis the site is built around: *I build systems that tell the truth,
especially when the truth is inconvenient.* The repo holds itself to it —
no guessed fact ships.

---

## Repo map

| Path | What it is |
| --- | --- |
| `packages/content/` | The single source of truth. `profile.ts` (identity, sections, capabilities, personal facts), `projects.ts` (three case studies + live URLs), `resume.ts` (derived), `knowledge.ts` (guide chunks), `search.ts` (BM25 + stemmer, shared by Worker and browser), `scope.ts` (guide refusal rules), `api-types.ts` (site ↔ Worker contract) |
| `apps/web/` | The site. All routes SSG. `app/` (routes, OG images, sitemap, robots, llms.txt), `components/home/` (eight sections + hero field-record plate), `components/work/` (case dossier plate), `components/ask/` (guide panel), `components/motion/` (cursor, counters, sound toggle, orchestration), `components/diagrams/` (one hairline architecture diagram per project), `lib/motion/` (tokens, lenis, veil, sound, haptics), `lib/local-guide.ts` (offline guide), `lib/events.ts` (non-identifying analytics), `scripts/build-resume.tsx` (PDF) |
| `apps/api/` | Cloudflare Worker. `src/` (Hono routes, retrieval — bge-m3 cosine + BM25 fallback, system prompt, Neurons budget guard, Neon access), `scripts/` (build-kb embeddings, migrate, evaluate), `migrations/` (five tables) |
| `CONTENT-TODO.md` | Facts awaiting Manoj's confirmation. The site publishes conservative wording until each is answered |

---

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

Gate for any change: `npm run typecheck` and `npm run build` pass clean,
and if the guide's scope, knowledge or search changed, `npm run api:eval`
holds — every refusal intact, ≥95% factual accuracy offline.

---

## Core features — built

1. **The monograph front page** — eight numbered sections (hero with live
   field-record plate: ticking IST clock, typed terminal transcript;
   recognition; selected work; how I work; capabilities; about; ask;
   contact), proof strip with counting numbers.
2. **Three case studies** at `/work/[slug]` — dossier plate per case
   (at-a-glance metric, deployment status, live-site / source doors),
   hairline architecture diagrams that draw on view, metric tables with
   provenance.
3. **The motion system ("Measured Precision")** — token grammar in
   `lib/motion/tokens.ts` + CSS `@theme`; GSAP choreography; Lenis
   wrapping native scroll; paper-veil route transitions; magnetic cursor
   with mono labels; CSS scroll-driven entrances inside `@supports`;
   designed reduced-motion tier. Sound: 5 synthesized Web Audio voices,
   default-off; haptics where the platform allows.
4. **Ask Manoj (the guide)** — three answer modes (hosted semantic /
   hosted lexical / offline extractive), one scope: `scope.ts` refuses
   private, off-topic, injection and false-premise questions *before* any
   model call. Answers only from published content, in the third person.
5. **One-content résumé** — `scripts/build-resume.tsx` renders
   `packages/content` to PDF at build time.
6. **Analytics without identity** — link events counted in Neon via the
   Worker; visitor = salted SHA-256 that rotates daily; transcripts
   auto-purged at 90 days, link events at 13 months (Worker cron).
7. **SEO surface** — per-route OG images generated from the same content,
   sitemap, robots, `/llms.txt`.

## Build-time and runtime hooks

- `build` runs `build-resume.tsx` **before** `next build` — the résumé
  route is never stale.
- `api:deploy` runs `build-kb.ts` (embeds `knowledge.ts` →
  `src/kb-vectors.json`) before `wrangler deploy`; without Cloudflare
  credentials it exits 0 and the Worker retrieves lexically.
- The Worker's Neurons budget guard downgrades the model at 70% of the
  daily allocation and rests at 90% with a static FAQ — the site never
  shows an error.

---

## Invariants — do not break these

1. **Single source of truth.** Facts live in `packages/content` only. Never
   hardcode a number, name or URL into a component.
2. **No guessed facts.** Unconfirmed items stay in `CONTENT-TODO.md` with
   their conservative on-site wording.
3. **Zero WebGL / zero 3D** — removed deliberately; do not reintroduce
   three.js or canvas rendering.
4. **No `§` glyphs** anywhere in rendered output — removed deliberately.
5. **Light-only.** No dark mode; the ivory/ink/IKB system is the identity.
6. **Motion through tokens** — durations, easings, stagger from the
   scales; every new animation needs a `prefers-reduced-motion` tier.
7. **Scope rules before model.** Refusals are classified in `scope.ts`, not
   scored; the offline guide holds the same bar.
8. **Hydration-safe time** — clocks render placeholders server-side and
   tick client-side only.
9. **Privacy is structural** — no cookies, no trackers, no raw IPs.

---

## Done vs pending

**Done** — the site as deployed at `manojc.vercel.app`:

- Full editorial site + motion layer, all routes SSG, Lighthouse-clean
- Ask Manoj: three modes, rule-based scope, 60-question eval gate
- Dossier plates with live deployment links (TailGen, AtmosView live;
  DrugOS is a research repo)
- Guide answers the published personal facts (age, location, contact,
  education) and refuses the rest
- Hero field-record plate: live clock + typed transcript (latest:
  `4b71c45`)
- 3D layer and colophon page removed per client decision

**Pending** — none of these block the build; all are decisions or assets
only Manoj can supply (details in `CONTENT-TODO.md`):

- Content confirmations: competition name/date, TiE event, degree type,
  class 10/12 details, teammates (consent needed), roles wording,
  interests, guide languages (Hindi/Kannada?)
- `apps/web/public/manoj.jpg` — the About portrait (4:5, ~800×1000);
  a typographic stand-in renders until it exists
- Rotate the AtmosView credentials exposed in the original repo's
  history before circulating that link
- Confirm the final domain (`manojc.vercel.app` vs `manoj-c.vercel.app`) —
  defined once in `profile.ts` → `site.url`

**Known rough edges:**

- Monorepo on Vercel: the project's root directory must be set to
  `apps/web` on import. `apps/web/vercel.json` pins the build/install
  commands, clean URLs, immutable static caching and the résumé's
  download disposition
- The guide's evaluation set (`apps/api/scripts/eval-set.ts`) and the
  FAQ list in `knowledge.ts` drift when scope rules change — update both
  together
