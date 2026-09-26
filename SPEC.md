# SPEC.md — plan and spec

What is being built, the parts it is made of, and where it stands.
Agent operating rules live in [CLAUDE.md](./CLAUDE.md).

---

## The build

A portfolio that presents three real engineered systems — **DrugOS**
(drug-repurposing knowledge graph: 13 sources, 9 node / 31 edge types,
heterogeneous GNN, PPO ranker), **TailGen** (score-based diffusion engine
for tail risk, with a certification layer that publishes its own FAIL
verdict) and **AtmosView** (weather platform that shows where its four
providers disagree) — as numbered case studies with their numbers,
sources and failure modes stated.

The site follows the same rule the three systems do: no guessed fact
ships. One content package renders the pages, the résumé PDF and the AI
guide's knowledge, so they cannot disagree. The design language is a
light-only "scientific atelier": ivory paper, ink ladder, International
Klein Blue, hairline rules, Newsreader / Switzer / JetBrains Mono, and a
token-governed motion system ("Measured Precision").

---

## Core features

1. **The monograph front page** — eight numbered sections; hero with a
   live field-record plate (ticking IST clock, typed terminal
   transcript), proof strip with counting numbers.
2. **Three case studies** at `/work/[slug]` — dossier plate per case
   (at-a-glance metric, deployment status, live-site / source doors),
   hairline architecture diagrams that draw on view, metric tables with
   provenance, live deployment links.
3. **The motion system** — paper-veil route transitions, Lenis wrapping
   native scroll, magnetic cursor with mono labels, counters, CSS
   scroll-driven entrances inside `@supports`, 5 synthesized Web Audio
   voices (default-off), haptics where the platform allows, designed
   reduced-motion tier.
4. **Ask Manoj** — retrieval-grounded guide in three modes (hosted
   semantic / hosted lexical / offline extractive), rule-based scope
   that refuses private, off-topic, injection and false-premise
   questions before any model call.
5. **One-content résumé** — PDF rendered from the content package at
   build time.
6. **Analytics without identity** — link events counted in Neon;
   visitor = salted daily-rotating SHA-256; transcripts purged at 90
   days, link events at 13 months.
7. **SEO surface** — per-route OG images from the same content,
   sitemap, robots, `/llms.txt`.

---

## Components

### Skills (modules the site is made of)

| Skill | Where | What it does |
| --- | --- | --- |
| Content pipeline | `packages/content` | Single source of truth; page, résumé and guide derive from it |
| Guide scope | `packages/content/scope.ts` + `apps/api/src` | Classifies refusables before any model call; three answer modes |
| Search | `packages/content/search.ts` | BM25 + stemmer, shared by the Worker (hosted) and the browser (offline) |
| Motion | `apps/web/lib/motion` + `components/motion` | Token grammar, veil, Lenis, sound, haptics, counters, cursor |
| Offline guide | `apps/web/lib/local-guide.ts` | Same scope rules in the browser; extractive, cannot invent |
| Résumé builder | `apps/web/scripts/build-resume.tsx` | Renders the content package to PDF |
| Analytics | `apps/web/lib/events.ts` + `apps/api/src` | Counted link events, no identity |
| Field record | `apps/web/components/home/HeroPlate.tsx` | Live clock + typed transcript; hydration-safe |

### Commands (the script inventory)

| Command | What it does |
| --- | --- |
| `npm run dev` | Site at localhost:3000, works out of the box |
| `npm run build` | Résumé PDF first, then the static site (SSG) |
| `npm run typecheck` / `lint` | Web workspace gates |
| `npm run resume` | Résumé PDF alone |
| `npm run api:dev` | Worker locally (wrangler) |
| `npm run api:eval` | 60-question guide evaluation — refusal + accuracy gate |
| `npm run api:migrate` | Neon migrations (needs `DATABASE_URL`) |
| `npm run api:deploy` | Embed the KB, then deploy the Worker |

Environment: the site needs nothing; one optional var
(`NEXT_PUBLIC_API_ORIGIN`) upgrades the guide from offline to hosted.
The Worker reads `DATABASE_URL`, `TURNSTILE_SECRET`, `VISITOR_HASH_SALT`
as secrets.

### Hooks (build-time, runtime, scheduled)

- **Build-time:** `build` runs the résumé generator *before* `next
  build`, so the résumé route is never stale. `api:deploy` runs
  `build-kb.ts` (embeds `knowledge.ts` → `kb-vectors.json`) before
  `wrangler deploy`; without Cloudflare credentials it exits 0 and the
  Worker retrieves lexically.
- **Runtime:** the Worker's Neurons budget guard downgrades the model at
  70% of the daily allocation and rests at 90% with a static FAQ — the
  site never shows an error. Writes go through `waitUntil`, buffered per
  isolate.
- **Scheduled:** Worker cron deletes chat transcripts after 90 days and
  link events after 13 months.

---

## Done vs pending

**Done** — deployed at `manojc.vercel.app`, commit on `main`:

- Full editorial site + motion layer, all routes SSG
- Three case studies with dossier plates and live deployment links
- Ask Manoj: three modes, rule-based scope, 60-question eval gate,
  answers published personal facts and refuses the rest
- Hero field-record plate: live clock + typed transcript
- Résumé generated from the same content; OG/sitemap/robots/llms.txt
- 3D layer and colophon page removed per client decision

**Pending** — none block the build; all need decisions or assets only
the owner can supply (details in `CONTENT-TODO.md`):

- Content confirmations: competition name/date, TiE event, degree type,
  class 10/12 details, teammates (consent), roles wording, personal
  interests, guide languages (Hindi/Kannada?)
- `apps/web/public/manoj.jpg` — About portrait (4:5, ~800×1000); a
  typographic stand-in renders until it exists
- Rotate the AtmosView credentials exposed in the original repo history
- Confirm the final domain (`manojc.vercel.app` vs `manoj-c.vercel.app`),
  defined once in `profile.ts` → `site.url`
