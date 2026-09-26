/**
 * What the guide will and will not talk about — decided before any model is
 * called, by rules rather than by a similarity score.
 *
 * The retrieval score cannot do this job. Measured over the 60-question
 * evaluation set, the best-chunk score for questions that must be refused
 * ranges from 0 to 0.84, and for questions that must be answered from 0 to
 * 1.0. The two distributions overlap completely, so any threshold that
 * refuses "who won the cricket match" also refuses "who is Manoj".
 *
 * So scope is classified explicitly. That has three benefits beyond accuracy:
 * the refusal is the same sentence every time, it costs no Neurons, and the
 * browser fallback and the hosted guide refuse identically — the degraded
 * path is not a weaker path where safety is concerned.
 *
 * Shared by apps/api (the Worker's pre-filter) and apps/web (the offline
 * guide), so there is one definition of "out of scope" and not two.
 */

import { identity } from './profile';

export type Scope =
  | 'answerable'
  | 'injection'
  | 'private'
  | 'off_topic'
  | 'not_on_site';

/* ── The fixed replies ─────────────────────────────────────────────────── */

export const OFF_TOPIC_REPLY =
  'I am only able to talk about Manoj — his projects, skills, education and how to reach him. For anything else a general assistant will serve you better. Would you like to hear about DrugOS, which took first place, or how to contact him?';

export const PRIVATE_REPLY = `That is not something this site covers, and I would rather not guess about it. If you would like to ask Manoj directly, his email is ${identity.email}.`;

export const NOT_ON_SITE_REPLY = `I do not have that on this site, and I will not invent it. Manoj can tell you himself — his email is ${identity.email}.`;

export const INJECTION_REPLY =
  'I am only able to talk about Manoj — his projects, skills, education and how to reach him. That includes not taking new instructions from a question. Would you like to hear about DrugOS, or how to contact him?';

export function replyFor(scope: Exclude<Scope, 'answerable'>): string {
  switch (scope) {
    case 'injection':
      return INJECTION_REPLY;
    case 'private':
      return PRIVATE_REPLY;
    case 'not_on_site':
      return NOT_ON_SITE_REPLY;
    default:
      return OFF_TOPIC_REPLY;
  }
}

/* ── The rules ─────────────────────────────────────────────────────────── */

/** Attempts to change the guide's role, rules or identity. */
const INJECTION = [
  /\bignore (your|the|all|any|previous|prior|above)\b/i,
  /\bdisregard (the|your|all|any|previous|prior|above)\b/i,
  /\b(system|initial|original) prompt\b/i,
  /\byou are now\b/i,
  /\bpretend (that |the |you |to )/i,
  /\bact as (a|an|if|though)\b/i,
  /\b(reveal|show me|print|repeat) your (instructions|prompt|rules)\b/i,
  /\banswer as manoj\b/i,
  /\bin the first person\b/i,
  /\bforget (everything|your|the)\b/i,
  /\bnew instructions?\b/i,
  /\bdo not follow\b/i,
];

/** About a person, rather than about work published on this site. */
const PRIVATE = [
  /\b(home |postal |residential |street )?address\b/i,
  /\bwhere does he live\b/i,
  /\bsalary|compensation|ctc|package expectation|how much (does|would) he (earn|want|charge)\b/i,
  /\bfamily|parents?|mother|father|sibling|brother|sister|wife|husband|girlfriend|boyfriend|married|marital\b/i,
  /\b(date of birth|dob|birthday|how old is he|his age)\b/i,
  /\breligion|caste|community|cast\b/i,
  /\bteam ?mates?\b.*\bname|\bname\b.*\bteam ?mates?\b/i,
  /\bby name\b/i,
  /\bpersonal (life|details|information)\b/i,
];

/** Asks the guide to be a general assistant. */
const OFF_TOPIC = [
  /\bwrite me\b/i,
  // Anything of the shape "write/generate/create … a Python script", with or
  // without a language sitting between the article and the noun.
  /\b(write|generate|produce|create|give me|send me|show me)\b[^.?!]{0,30}?\b(script|code|program|function|snippet|query|regex|essay|poem|email|letter|story|sql)\b/i,
  /\bhow do i (write|code|implement|build|fix|install)\b/i,
  /\b(translate|summari[sz]e|proofread|debug|refactor) (this|my|the following)\b/i,
  /\bwho won\b/i,
  /\b(cricket|football|tennis|match score|the score|world cup|ipl)\b/i,
  /\b(weather|temperature) (today|tomorrow|right now|in my)\b/i,
  /\b(news|headlines) (today|this week)\b/i,
  /\b(government|politics|political|election|prime minister|president)\b/i,
  /\bwhat do you think (of|about)\b/i,
  /\byour (opinion|view) (on|of|about)\b/i,
  /\b(recommend|prescribe|suggest) (a |an )?(drug|medicine|medication|treatment)\b/i,
  /\b(medical|legal|financial|investment) advice\b/i,
  /\bstock (tip|pick)|should i (buy|sell|invest)\b/i,
];

/**
 * Employment history. The site does not claim any, so a question that
 * presupposes some is answered with "not on this site" rather than with the
 * nearest chunk that happens to mention the word "internship".
 */
const EMPLOYMENT_PREMISE = [
  /\b(worked?|working) (at|for)\b/i,
  /\bintern(ed|ship) (at|with|for)\b/i,
  /\bhis (previous |last |first )?(job|employer|company|startup|role at)\b/i,
  /\bwhich (company|startup|firm)\b/i,
  /\b(found|founded|co-?found(ed)?) (a |an |his |the )?(company|startup)?\b/i,
  /\byears of (industry |professional |work )?experience\b/i,
];

/* ── Proper nouns the site has never heard of ──────────────────────────── */

/** Capitalised words that are ordinary English rather than names. */
const SENTENCE_WORDS = new Set([
  'i',
  'a',
  'an',
  'the',
  'what',
  'who',
  'which',
  'where',
  'when',
  'why',
  'how',
  'does',
  'do',
  'did',
  'is',
  'was',
  'are',
  'can',
  'could',
  'would',
  'should',
  'tell',
  'give',
  'show',
  'explain',
  'describe',
  'list',
  'write',
  'ignore',
  'pretend',
  'disregard',
  'you',
  'he',
  'his',
  'him',
  'me',
  'my',
  'please',
  'hi',
  'hello',
  'hey',
  'ok',
  'okay',
  'so',
  'and',
  'but',
  'if',
  'in',
  'on',
  'at',
  'for',
  'to',
  'of',
  'about',
  'has',
  'have',
  'had',
  'it',
  'this',
  'that',
  'there',
]);

/**
 * True when the question names something the site has never mentioned —
 * "his Google internship", "the LTCM project". The presupposition is false,
 * and answering from the nearest chunk would dress a guess up as an answer.
 */
export function namesUnknownEntity(
  message: string,
  vocabulary: ReadonlySet<string>,
): boolean {
  const words = message.trim().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const raw = words[i].replace(/[^A-Za-z0-9.+-]/g, '');
    if (raw.length < 3) continue;
    // The first word of a sentence is capitalised by grammar, not by meaning.
    if (i === 0) continue;
    if (!/^[A-Z]/.test(raw)) continue;
    const lower = raw.toLowerCase();
    if (SENTENCE_WORDS.has(lower)) continue;
    if (vocabulary.has(lower)) continue;
    return true;
  }
  return false;
}

/* ── The classifier ────────────────────────────────────────────────────── */

export function classifyScope(
  message: string,
  vocabulary?: ReadonlySet<string>,
): Scope {
  const m = message.trim();
  if (m.length === 0) return 'off_topic';

  if (INJECTION.some((re) => re.test(m))) return 'injection';
  if (PRIVATE.some((re) => re.test(m))) return 'private';
  if (OFF_TOPIC.some((re) => re.test(m))) return 'off_topic';
  if (EMPLOYMENT_PREMISE.some((re) => re.test(m))) return 'not_on_site';
  if (vocabulary && namesUnknownEntity(m, vocabulary)) return 'not_on_site';

  return 'answerable';
}

export const isGreeting = (message: string): boolean =>
  /^(hi|hey|hello|yo|namaste|good (morning|afternoon|evening))\b/i.test(
    message.trim(),
  ) && message.trim().length < 40;

export const GREETING_REPLY =
  "Hello. I am an AI guide to Manoj's work — I can talk about his three systems, his skills and education, and how to reach him. What would you like to know?";
