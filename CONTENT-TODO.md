# Content to confirm before launch

The site does not publish a guessed fact. Every item below is currently either
absent from the site or written in the most conservative form the source
material supports. Answer these and the copy tightens considerably.

Each item names the file to edit. Nothing here blocks the site from running.

---

### 1. The competition DrugOS won

**Status on the site:** "first place in a college-level competition" — no name,
no date.
**Needed:** the exact competition name and date.
**Edit:** `packages/content/profile.ts` → `recognition.body[2]`, and
`packages/content/resume.ts` → Achievements.

### 2. The TiE event

**Status:** "selected for the TiE global event".
**Needed:** which event (TiE Global Summit? a TiE Bangalore programme?), its
date, and what "selected" means — shortlisted, presenting, or competing.
**Edit:** same two places as item 1.

### 3. The degree

**Status:** "Digital Transformation, minor in AI & ML", no degree type.
**Needed:** B.Tech, B.Sc. or other, plus the expected graduation year.
**Edit:** `packages/content/profile.ts` → `education[0]`, and `resume.ts`.

### 4. Class 10 and 12

**Status:** school names only, no years, boards or scores.
**Needed:** a decision — show year/board/score, or leave the names alone. The
layout works either way; `education[].note` is empty for both.
**Edit:** `packages/content/profile.ts` → `education`.

### 5. The Team Cosmic teammates

**Status:** not named. The guide is configured to refuse the question "who are
his teammates, by name?" because naming people without their consent is not
something a portfolio should do by default.
**Needed:** a decision, and if yes, three names and any links. Crediting them
strengthens the leadership story.
**Edit:** `packages/content/profile.ts` → `recognition`, and the DrugOS entry
in `projects.ts`. Also remove the `teammates … by name` rule from
`packages/content/scope.ts` and the matching case in
`apps/api/scripts/eval-set.ts`.

### 6. What roles Manoj is open to

**Status:** "engineering internships now and full-time work from graduation —
ML systems or full-stack, in Bengaluru or remote." This was inferred from the
PRD and should be confirmed or replaced in his own words.
**Edit:** `packages/content/profile.ts` → `contact.openTo`.

### 7. A photograph, and Fig. 2.1

**Status:** `/manoj.jpg` does not exist, so the About plate renders a
typographic stand-in at exactly the proportion the photograph will take. No
stock image and no generated face has been substituted.
Fig. 2.1 in §02 currently holds the facts of the DrugOS build rather than a
photograph or certificate.
**Needed:** `apps/web/public/manoj.jpg`, colour-graded warm, 4:5, around
800×1000. And a photo or certificate for Fig. 2.1 if one exists.
**Edit:** drop the file in `apps/web/public/`. Nothing else changes.

### 8. Live demos and final screenshots

**Status:** no demo links anywhere; the case studies link only to source.
**Needed:** which of the three have live deployments, and which screenshots
are final. The case-study template has room for figure plates between the
architecture diagram and the results table.
**Edit:** `packages/content/projects.ts`.

### 9. Personal interests

**Status:** absent. §06 is three paragraphs about engineering.
**Needed:** one or two interests outside engineering, if he wants them there.
A single specific sentence is worth more than a list.
**Edit:** `packages/content/profile.ts` → `about.paragraphs`.

### 10. Languages the guide answers in

**Status:** English only. The system prompt does not mention Hindi or Kannada.
**Needed:** a decision. Workers AI models handle both; the rule would be that
the language changes and the facts do not.
**Edit:** `apps/api/src/prompt.ts` → `SYSTEM_PROMPT`, and add evaluation cases
to `apps/api/scripts/eval-set.ts`.

---

## Not content, but blocking

### Rotate the AtmosView credentials

The AtmosView write-up records that the original repository history contained a
live MongoDB URI, a JWT secret and API keys. This site sends visitors straight
to that GitHub account, and the AtmosView case study says so in its own
Limitations section. Rotate them before launch.

### Confirm the domain

`packages/content/profile.ts` → `site.url` is `https://manojc.vercel.app`.
Check the subdomain is free; the fallback is `manoj-c.vercel.app`. It appears
in canonical URLs, the sitemap, `/llms.txt`, the JSON-LD and the résumé footer,
and it is defined in exactly one place.
