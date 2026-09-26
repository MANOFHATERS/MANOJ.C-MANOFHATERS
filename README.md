# Manoj C — portfolio

A light-only, editorial portfolio built as a typographic monograph: three real
engineered systems presented as numbered case studies, a motion system built
on a token grammar, and an AI guide that answers questions about Manoj and
declines everything else. The résumé is generated from the same content that
renders the pages.

> I build systems that tell the truth, especially when the truth is
> inconvenient.

**Live:** <https://manojc.vercel.app>

---

## Quick start

```bash
npm install
npm run dev
```

The site is at <http://localhost:3000>. It runs entirely out of the box:
every route is statically generated, and with no API configured the guide
falls back to an offline, extractive mode that runs in the browser over the
same content (see [Ask Manoj](#ask-manoj)).

```bash
npm run build       # résumé PDF, then the static site
npm run typecheck   # the web workspace
npm run api:eval    # the 60-question guide evaluation
```

---

## What this is

Three systems, one page each, written like a published paper rather than a
product tour — with the numbers, the sources and the failure modes stated:

- **DrugOS** — a drug-repurposing knowledge graph. 13 sources into 9 node and
  31 edge types, a heterogeneous GNN, and a PPO-trained ranker. First place
  in a college-level competition, selected for a TiE global event.
- **TailGen** — a generative tail-risk engine. Score-based diffusion over
  market returns, with a certification layer that publishes its own FAIL
  verdict (5 of 7 gates) on the model it ships.
- **AtmosView** — a weather platform that shows where its four providers
  disagree, because a 3 °C spread is information and averaging destroys it.

The site itself follows the same rule the three systems do: it publishes no
guessed fact. Every number on it comes from `packages/content` with its
source, or it does not appear.

---

## Layout

```
packages/content/     the single source of truth
  profile.ts          identity, sections, capabilities, personal facts
  projects.ts         the three case studies, every number with its source
  resume.ts           the résumé, derived from the above
  knowledge.ts        the guide's knowledge chunks, built from all of it
  search.ts           BM25 + stemmer, shared by the Worker and the browser
  scope.ts            what the guide will and will not answer
  api-types.ts        the contract between the site and the Worker

apps/web/             Next.js 16, React 19, statically generated
  app/                routes, OG images, sitemap, robots, llms.txt
  components/
    home/             the eight sections of the front page, incl. the
                      hero's field-record plate (live clock + transcript)
    work/             the case-study dossier plate
    ask/              the guide's panel and provider
    motion/           cursor, counters, sound toggle, scroll orchestration
    diagrams/         one hairline architecture diagram per project
  lib/
    motion/           the motion module: tokens, lenis, veil, sound, haptics
    local-guide.ts    the offline guide, same scope rules in the browser
    events.ts         link analytics — counted, never identifying
  scripts/            the résumé PDF generator
  assets/fonts/       self-hosted instances of the three typefaces

apps/api/             Cloudflare Worker (Hono)
  src/                routes, retrieval, prompt, budget guard, Neon
  scripts/            knowledge-base embeddings, migrations, evaluation
  migrations/         the five tables
```

Everything on the site comes from `packages/content`. The page, the résumé
PDF and the guide are three renderings of one set of facts, so they cannot
disagree with each other.

---

## The design

Light only — by decision, not omission. Warm ivory paper (`#FAF9F6`), a warm
ink ladder, one signal colour — International Klein Blue `#002FA7`, at
10.15:1 on the paper, AAA at every size — hairline rules, numbered figures,
and two-digit section numbering borrowed from the DrugOS specification that
governed that project's build and is cited 547 times in its code.

- **Type:** Newsreader (display and prose, optical sizes 6–72), Switzer
  (interface — ITF's Swiss neo-grotesk in the Helvetica/Univers lineage,
  deliberately not Inter), JetBrains Mono (every number; tabular figures,
  self-hosted with the arrows `← → ↗` the Google Fonts latin subset does not
  ship). Old-style figures in prose, tabular lining figures in tables.
- **Motion — "Measured Precision":** the site moves like a Swiss chronometer,
  not a slot machine. A versioned token system in `lib/motion/tokens.ts` and
  the CSS `@theme` block governs every duration, easing and stagger. GSAP
  drives the choreography and the page veil; Lenis wraps — never replaces —
  native scroll; entrances are native CSS scroll-driven animation inside
  `@supports`, so a browser without it shows finished content.
- **Signature moments:** the paper-veil route transition (a sheet of the
  page's own ivory with a 1px IKB leading edge), the hero's field-record
  plate — a live IST clock with ticking seconds and a terminal that types
  `whoami`, `role`, `base`, `status` — the sticky proof strip with counting
  numbers, the magnetic cursor with mono labels, the case-study dossier
  plates with their letterpress lift, and the 404 set in a dot-matrix
  constellation.
- **Sound and haptics:** five synthesized voices on the Web Audio API —
  zero audio files, CSP untouched — off by default, persisted, one click to
  reverse. Vibration is an Android-only honesty clause.
- **Reduced motion:** a designed tier-two experience, not a kill switch —
  entrances, parallax, cursor and smooth scroll are removed; colour, focus
  and the drawn check are retained, because removing feedback removes
  information.

---

## Ask Manoj

A retrieval-grounded guide. It speaks *about* Manoj in the third person,
never as him, and it can only say things already printed on this site.

**Scope is decided by rules, before any model is called.** A similarity score
cannot do that job: measured over the 60-question evaluation set, the
best-chunk score for questions that must be refused ranges 0–0.84 and for
questions that must be answered 0–1.0 — the distributions overlap
completely, so any threshold that refuses "who won the cricket match" also
refuses "who is Manoj". So `packages/content/scope.ts` classifies injection
attempts, private questions, general-assistant requests and false premises
explicitly. Those answers cost no Neurons and read identically every time.

### Three ways it can answer

| Mode | When | How |
| --- | --- | --- |
| Hosted, semantic | `NEXT_PUBLIC_API_ORIGIN` set, embeddings built | bge-m3 vectors in the Worker bundle, cosine search, LLM with the top chunks |
| Hosted, lexical | Worker up, embeddings not built or embedding call failed | BM25 over the same chunks, same LLM |
| Offline | Worker unreachable or not configured | The same scope rules and the same BM25 in the browser, answering with the sentences that matched — extractive, so it cannot invent anything |

The offline mode is why the site works out of the box. It is a smaller
guide, not a less honest one, and it is held to the same refusal bar in CI.

### Evaluation

```bash
npm run api:eval                                    # offline guide
API=https://manoj-api.<account>.workers.dev npm run api:eval   # hosted
```

60 questions: 35 factual, 10 technical-depth, 15 adversarial, private or
off-topic. It fails the build unless every refusal holds, nothing from a
`forbid` list appears, factual accuracy is at least 95%, and — against a
live Worker — the median first token arrives inside 1.5s.

---

## Environment

The site itself needs nothing. One optional variable:

```
NEXT_PUBLIC_API_ORIGIN = https://manoj-api.<account>.workers.dev
```

Set it and the guide upgrades from offline mode to the hosted Worker. Leave
it unset and everything else on the site works exactly the same — every
route is static and has no runtime dependency.

For working on the API and the database, the scripts are in
`apps/api/package.json` (`dev`, `deploy`, `kb`, `eval`, `migrate`, run via
`npm run api:*` from the root). The Worker reads `DATABASE_URL`,
`TURNSTILE_SECRET` and `VISITOR_HASH_SALT` as secrets.

---

## Conventions

- **One source of truth.** Content changes happen in `packages/content`,
  never in components. The page, the résumé and the guide re-derive from it
  together.
- **No guessed facts.** If a number's source is not confirmed, it does not
  ship. Unconfirmed items live in `CONTENT-TODO.md`.
- **Zero WebGL.** The 3D layer was built and then removed on purpose; the
  site is now pure DOM and SVG. Do not add a 3D dependency.
- **Light only.** There is no dark mode and there will not be one.
- **Motion goes through tokens.** New animation uses the scales in
  `lib/motion/tokens.ts` and the CSS `@theme` block, and has a designed
  `prefers-reduced-motion` tier.
- **Privacy is structural.** No cookies, no third-party trackers; a visitor
  is a salted daily-rotating hash, transcripts are deleted after 90 days.

Working with an AI agent on this repo? It reads [CLAUDE.md](./CLAUDE.md) —
the plan-and-spec document: what is built, how the pieces fit, the commands,
and what is pending.
