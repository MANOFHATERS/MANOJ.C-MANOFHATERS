# Manoj C — portfolio

A light-only, editorial "scientific atelier" portfolio. Three real systems, one
3D specimen, an AI guide that answers questions about Manoj and declines
everything else, and a résumé generated from the site's own content.

Runs for ₹0 a month: Vercel Hobby for the site, Cloudflare Workers with
Workers AI for the API, Neon Free Postgres for storage.

> I build systems that tell the truth, especially when the truth is
> inconvenient.

---

## Quick start

```bash
npm install
npm run dev
```

The site is at <http://localhost:3000>. The guide works immediately — with no
API configured it falls back to an offline, extractive guide that runs in the
browser over the same content (see [Ask Manoj](#ask-manoj)).

```bash
npm run build       # résumé PDF, then the static site
npm run typecheck   # both workspaces
npm run api:eval    # the 60-question guide evaluation
```

---

## Layout

```
packages/content/     the single source of truth
  profile.ts          identity, sections, capabilities, colophon
  projects.ts         the three case studies, every number with its source
  resume.ts           the résumé, derived from the above
  knowledge.ts        the chatbot's chunks, built from all of it
  search.ts           BM25 + stemmer, shared by the Worker and the browser
  scope.ts            what the guide will and will not answer
  api-types.ts        the contract between the site and the Worker

apps/web/             Next.js 16, React 19, statically generated
  app/                routes, OG images, sitemap, robots, llms.txt
  components/         hand-built to the art direction; no component kit
    specimen/         the 3D object and its vector stills
    motion/           the cursor, counters, sound toggle, TOC rail
    diagrams/         one hairline architecture diagram per project
  lib/                specimen geometry, the offline guide, analytics
    motion/           the motion module: tokens, lenis, veil, sound, haptics
  scripts/            the résumé PDF generator
  assets/fonts/       static instances of the three typefaces

apps/api/             Cloudflare Worker (Hono)
  src/                routes, retrieval, prompt, budget guard, Neon
  scripts/            knowledge-base embeddings, migrations, evaluation
  migrations/         the five tables
```

Everything on the site comes from `packages/content`. The page, the résumé PDF
and the guide are three renderings of one set of facts, so they cannot
disagree with each other.

---

## The design

Light only — by decision, not omission. Warm ivory paper (`#FAF9F6`), a warm
ink ladder, one signal colour — International Klein Blue `#002FA7`, at
10.15:1 on the paper, so it is link-safe and AAA at every size — hairline
rules, numbered figures, and the section mark `§` borrowed from the DrugOS
specification that governed that project's build and is cited 547 times in
its code.

- **Type:** Newsreader (display and prose, optical sizes 6–72), Switzer
  (interface — ITF's Swiss neo-grotesk in the Helvetica/Univers lineage,
  deliberately not Inter), JetBrains Mono (every number; the largest x-height
  of any mono, self-hosted with the arrows `← → ↗` that the Google Fonts
  latin subset does not ship). Old-style figures in prose, tabular lining
  figures in tables.
- **Motion — "Measured Precision":** the site moves like a Swiss chronometer,
  not a slot machine. A versioned token system (durations in two registers,
  productive vs expressive; Carbon-calibrated easings; stagger and parallax
  laws) governs every value, published on the
  [colophon](/colophon) as live documentation. GSAP + ScrollTrigger drive the scroll choreography, Lenis
  wraps — never replaces — the native scroll, and entrances remain native CSS
  scroll-driven animation inside `@supports`, so a browser without it shows
  finished content. The drawn arrow system (custom SVGs, 1.5px stroke, butt
  caps) still carries the one hover signature: the arrow swap.
- **Signature moments:** the paper veil route transition (a sheet of the
  page's own ivory with a 1px IKB leading edge), the shared-specimen morph
  from the work index into a case study's header plate, the sticky proof
  strip with counting numbers, the magnetic cursor with mono labels, the
  specimen's drag inertia and scroll-linked drift, and the 404 set in the
  specimen's own node constellation.
- **Sound and haptics:** five synthesized voices on the Web Audio API —
  zero audio files, CSP untouched — off by default, persisted, one click to
  reverse. Vibration is an Android-only honesty clause.
- **Reduced motion:** a designed tier-two experience, not a kill switch —
  entrances, parallax, cursor, smooth scroll and specimen motion removed;
  colour, focus, the drawn check and the latched rating retained, because
  removing feedback removes information.

### The specimen

240 nodes, three states, one WebGL context:

| State | Meaning |
| --- | --- |
| The Graph | DrugOS's knowledge graph, with one drug→outcome path in pigment |
| The Tail | TailGen's fat-tailed return distribution, left tail in pigment |
| The Field | AtmosView's four providers over India, offset by their disagreement |

Positions are computed from a fixed seed at module load — about 50 KB of
`Float32Array`, no binary asset to fetch. On desktop the object lives in a
fixed rail and morphs as the reader scrolls through the three project plates,
with anticipation (the rotation addresses the next state before the morph
begins), a settle-through scale dip, ±8° of scroll-linked drift, and drag
inertia with honest friction — the momentum the reader imparted, decaying,
never bounced. Hovered nodes scale to 1.4 on the tap spring and name their
type. On a phone each plate carries its own still.

It loads after the hero text has painted and the browser is idle, pauses when
it leaves the viewport or the tab is hidden, and is replaced by a **vector**
still for anyone with reduced motion, Save-Data, or no WebGL. The PRD asked
for pre-rendered AVIF stills; SVG drawn from the same position data is sharper
at every size, about 20 KB, needs no build step, and cannot drift out of sync
with the 3D object because it is generated from it.

---

## Ask Manoj

A retrieval-grounded guide. It speaks *about* Manoj in the third person, never
as him, and it can only say things already printed on this site.

**Scope is decided by rules, before any model is called.** A similarity score
cannot do that job: measured over the 60-question evaluation set, the best-chunk
score for questions that must be refused ranges 0–0.84 and for questions that
must be answered 0–1.0 — the distributions overlap completely, so any threshold
that refuses "who won the cricket match" also refuses "who is Manoj". So
`packages/content/scope.ts` classifies injection attempts, private questions,
general-assistant requests and false premises explicitly. Those answers cost no
Neurons and read identically every time.

### Three ways it can answer

| Mode | When | How |
| --- | --- | --- |
| Hosted, semantic | `NEXT_PUBLIC_API_ORIGIN` set, embeddings built | bge-m3 vectors in the Worker bundle, cosine search, LLM with the top chunks |
| Hosted, lexical | Worker up, embeddings not built or embedding call failed | BM25 over the same chunks, same LLM |
| Offline | Worker unreachable or not configured | The same scope rules and the same BM25 in the browser, answering with the sentences that matched — extractive, so it cannot invent anything |

The offline mode is why the site works out of the box. It is a smaller guide,
not a less honest one, and it is held to the same refusal bar in CI.

### Evaluation

```bash
npm run api:eval                                    # offline guide
API=https://manoj-api.<account>.workers.dev npm run api:eval   # hosted
```

60 questions: 35 factual, 10 technical-depth, 15 adversarial, private or
off-topic. It fails the build unless every refusal holds, nothing from a
`forbid` list appears, factual accuracy is at least 95%, and — against a live
Worker — the median first token arrives inside 1.5s.

---

## Deploying

### The site (Vercel Hobby)

Import the repo, set the root directory to `apps/web`, and add:

```
NEXT_PUBLIC_API_ORIGIN = https://manoj-api.<account>.workers.dev
```

Leave it unset and the guide simply uses its offline mode. Everything else on
the site is static and has no runtime dependency at all.

### The API (Cloudflare Workers)

```bash
cd apps/api
wrangler secret put DATABASE_URL        # Neon, insert/select/delete only
wrangler secret put TURNSTILE_SECRET    # optional; unset means unenforced
wrangler secret put VISITOR_HASH_SALT   # any long random string

CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... npm run kb
npm run deploy
```

`npm run kb` embeds the knowledge base into `src/kb-vectors.json`. Without
credentials it says so and exits 0; the Worker then retrieves lexically.

### The database (Neon)

```bash
DATABASE_URL=... npm run api:migrate
```

Five tables. No names, no email addresses, no raw IP addresses: a visitor is a
SHA-256 of their address plus a salt that rotates daily, so the same person is
a different key tomorrow. Transcripts are deleted after 90 days and link
events after 13 months, by the Worker's cron trigger.

---

## Free-tier headroom

| Service | Free limit | Expected | Headroom |
| --- | --- | --- | --- |
| Vercel — transfer | 100 GB/month | ~3.6 GB | ~27× |
| Workers — requests | 100,000/day | under 2,000 | 50× |
| Workers AI | 10,000 Neurons/day | ~5,100 on a 150-question day | ~2× at peak |
| Neon — storage | 0.5 GB | under 50 MB in year one | 10× |
| Neon — compute | 100 CU-hours/month | tight at peak | writes batched, 0.25 CU cap |

Neon compute is the tightest. Every write goes through `waitUntil`, events are
buffered per isolate and flushed in batches, and the budget counter is cached
for 60 seconds — so a busy day wakes the database far less often than it
serves requests. If it runs out, the chat carries on and stops being logged.

The Workers AI budget guard switches to the cheaper model at 70% of the daily
allocation and rests at 90%, serving a static FAQ with the line "The guide is
resting until 5:30 AM IST". The site never shows an error.

---

## What still needs Manoj

See [CONTENT-TODO.md](./CONTENT-TODO.md). Ten facts are unconfirmed — the
competition name, the TiE event, the degree, the photograph and so on — and
the site is written in its most conservative form until they are answered. It
publishes no guessed fact, which is the same rule the three systems on it
follow.
