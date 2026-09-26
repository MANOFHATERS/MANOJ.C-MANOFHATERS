/**
 * The Ask Manoj knowledge base, derived from profile.ts and projects.ts.
 *
 * Nothing is written here that is not already on the site. That is the point:
 * the guide can only say things a visitor could have read for themselves, so it
 * cannot drift away from the page or invent a fact that has no source.
 *
 * Built at compile time. The Worker embeds these chunks once and ships the
 * vectors inside the bundle; the browser fallback searches them lexically when
 * the Worker is unreachable.
 */

import {
  about,
  capabilities,
  colophon,
  contact,
  education,
  identity,
  principles,
  proofStrip,
  recognition,
  site,
  standfirst,
} from './profile';
import { projects } from './projects';
import type { FaqItem } from './api-types';

export interface Chunk {
  /** Stable id, cited by the model as `[[sources: id]]`. */
  readonly id: string;
  readonly title: string;
  readonly href: string;
  /** The section mark this chunk belongs to, e.g. "03". */
  readonly section: string;
  readonly text: string;
}

const chunks: Chunk[] = [];
const add = (c: Chunk) => {
  chunks.push(c);
};

/* ── Identity ─────────────────────────────────────────────────────────── */

add({
  id: 'id-who',
  title: 'Who Manoj is',
  href: '/#top',
  section: '01',
  text: `${identity.name} is a ${identity.role.replace(' · ', ' and ')} based in ${identity.location}. ${standfirst}. The thesis of his work is: "${site.thesis}" He has shipped three systems: DrugOS, TailGen and AtmosView.`,
});

add({
  id: 'id-contact',
  title: 'How to contact Manoj',
  href: '/#contact',
  section: '08',
  text: `Manoj can be reached by email at ${identity.email}. His phone number is ${identity.phone}. His GitHub is ${identity.githubHandle} and his LinkedIn is ${identity.linkedinHandle}. ${contact.openTo} Email is the most reliable way to reach him.`,
});

add({
  id: 'id-open-to',
  title: 'What Manoj is open to',
  href: '/#contact',
  section: '08',
  text: `${contact.openTo} He is a third-year undergraduate, so internships are available now and full-time work from graduation. Both machine-learning systems roles and full-stack roles fit the work on this site.`,
});

add({
  id: 'id-education',
  title: 'Education',
  href: '/#about',
  section: '06',
  text: `Manoj studies at Atria University in Bengaluru. He is a third-year undergraduate there, reading Digital Transformation with a minor in AI and ML. His CGPA is 8.1. He attended Sri Chaitanya for Class 12 and Maruthi Vidyalaya for Class 10. ${education
    .map((e) => e.institution)
    .join(', ')}.`,
});

add({
  id: 'id-achievement',
  title: 'Headline achievement',
  href: '/#recognition',
  section: '02',
  text: `DrugOS took first place in a college-level competition and was selected for the TiE global event. Manoj was the originator, architect and project lead for Team Cosmic, a team of four. ${proofStrip
    .map((p) => `${p.value} ${p.label}`)
    .join('; ')}.`,
});

add({
  id: 'id-bio',
  title: 'About Manoj, in his own words',
  href: '/#about',
  section: '06',
  text: about.paragraphs.join(' '),
});

/* ── Recognition ──────────────────────────────────────────────────────── */

recognition.body.forEach((para, i) => {
  add({
    id: `rec-${i + 1}`,
    title: recognition.headline,
    href: '/#recognition',
    section: '02',
    text: para,
  });
});

/* ── Principles ───────────────────────────────────────────────────────── */

principles.forEach((p) => {
  add({
    id: `how-${p.n}`,
    title: `How Manoj works: ${p.title}`,
    href: '/#how-i-work',
    section: '04',
    text: `${p.title}. ${p.lede} ${p.body} Evidence: ${p.evidence}.`,
  });
});

/* ── Capabilities ─────────────────────────────────────────────────────── */

capabilities.forEach((c) => {
  add({
    id: `cap-${c.group.toLowerCase().replace(/\s+/g, '-')}`,
    title: `Skills: ${c.group}`,
    href: '/#capabilities',
    section: '05',
    text:
      c.group === 'Data'
        ? `Data and databases: ${c.skills.join(', ')}. These are the databases and data tools Manoj has used and stored data in. They are proven in ${c.proof}.`
        : `${c.group} skills: ${c.skills.join(', ')}. They are proven in ${c.proof}.`,
  });
});

add({
  id: 'cap-summary',
  title: 'Tech stack overview',
  href: '/#capabilities',
  section: '05',
  text: `Manoj's stack across all three systems: ${capabilities
    .map((c) => `${c.group} — ${c.skills.join(', ')}`)
    .join('; ')}.`,
});

/* ── Projects ─────────────────────────────────────────────────────────── */

for (const p of projects) {
  const href = `/work/${p.slug}`;

  // Prose and metadata are separate chunks on purpose. Mixed together, a
  // question like "explain TailGen simply" retrieves the right chunk and then
  // has to quote "Repository: …" and "Stack: …" alongside the explanation.
  add({
    id: `${p.slug}-overview`,
    title: `${p.name} — what it is`,
    href,
    section: '03',
    text: `${p.fullName}. ${p.tagline} It is one of the three systems Manoj has shipped.`,
  });

  add({
    id: `${p.slug}-facts`,
    title: `${p.name} — role, stack and repository`,
    href,
    section: '03',
    text: `On ${p.name}, Manoj's role was ${p.role}, ${p.team}, in ${p.year}. The repository is ${p.repoLabel}. The stack is ${p.stack.join(', ')}. Its headline number is ${p.headline.value} — ${p.headline.label}.`,
  });

  p.abstract.forEach((para, i) => {
    add({
      id: `${p.slug}-abstract-${i + 1}`,
      title: `${p.name} — abstract`,
      href,
      section: '03',
      text: para,
    });
  });

  p.problem.body.forEach((para, i) => {
    add({
      id: `${p.slug}-problem-${i + 1}`,
      title: `${p.name} — ${p.problem.heading}`,
      href: `${href}#problem`,
      section: '03',
      text: para,
    });
  });

  p.architecture.walkthrough.forEach((para, i) => {
    add({
      id: `${p.slug}-arch-${i + 1}`,
      title: `${p.name} — architecture`,
      href: `${href}#architecture`,
      section: '03',
      text: para,
    });
  });

  p.hardProblems.forEach((hp, i) => {
    add({
      id: `${p.slug}-hard-${i + 1}`,
      title: `${p.name} — ${hp.title}`,
      href: `${href}#hard-problems`,
      section: '03',
      text: `${hp.title}. The problem: ${hp.problem} The decision: ${hp.decision} The result: ${hp.result}`,
    });
  });

  add({
    id: `${p.slug}-results`,
    title: `${p.name} — results`,
    href: `${href}#results`,
    section: '03',
    text: `These are the ${p.name} results, each one with the run or file it was read from. ${p.results.rows
      .map(
        (r) =>
          `${r.metric}: ${r.value}${r.comparison ? ` (${r.comparison})` : ''}, from ${r.source}`,
      )
      .join('. ')}.`,
  });

  if (p.results.note) {
    add({
      id: `${p.slug}-results-note`,
      title: `${p.name} — reading the results honestly`,
      href: `${href}#results`,
      section: '03',
      text: p.results.note,
    });
  }

  add({
    id: `${p.slug}-limitations`,
    title: `${p.name} — limitations`,
    href: `${href}#limitations`,
    section: '03',
    text: `These are the limitations of ${p.name}, and what does not work in it, stated by Manoj rather than found by a reviewer. ${p.limitations.join(' ')}`,
  });

  add({
    id: `${p.slug}-next`,
    title: `${p.name} — what I would do next`,
    href: `${href}#next`,
    section: '03',
    text: `These are the three things Manoj would do next on ${p.name}. ${p.next.join(' ')}`,
  });
}

/* ── The site itself ──────────────────────────────────────────────────── */

add({
  id: 'site-colophon',
  title: 'How this site is built',
  href: '/colophon',
  section: '09',
  text: `This portfolio is built with ${colophon.stack
    .map(([k, v]) => `${k}: ${v}`)
    .join(' ')} Typefaces: ${colophon.typefaces
    .map((t) => `${t.name} by ${t.by}`)
    .join(', ')}. ${colophon.note}`,
});

add({
  id: 'site-privacy',
  title: 'What this site stores about you',
  href: '/colophon#privacy',
  section: '09',
  text: `This is everything the site stores about a visitor, and for how long. ${colophon.privacy.join(' ')}`,
});

add({
  id: 'site-code',
  title: 'Where the code is',
  href: identity.github,
  section: '03',
  // Deliberately does not list the project names. This chunk answers "where
  // is the code", and naming all three here made it outrank every project's
  // own chunk whenever someone asked about one of them by name.
  text: `All of Manoj's source code is public on GitHub at ${identity.githubHandle}, where all three repositories are open. Each case study on this site links to its own repository and its source.`,
});

add({
  id: 'site-resume',
  title: 'Résumé',
  href: '/resume',
  section: '10',
  text: `Manoj's résumé is available as a readable page at /resume and as a one-page PDF download. It is generated from the same content file that produces this site, so the two cannot disagree. Updated ${site.updated}.`,
});

export const knowledgeBase: readonly Chunk[] = chunks;

/* ── FAQ: the static fallback when the guide cannot be reached ─────────── */

export const faq: readonly FaqItem[] = [
  {
    q: 'What did Manoj win with DrugOS?',
    a: 'DrugOS took first place in a college-level competition and was selected for the TiE global event. Manoj was the originator, architect and project lead for a team of four.',
    href: '/work/drugos',
  },
  {
    q: 'What is DrugOS?',
    a: 'A four-phase system that fuses thirteen biomedical sources into a knowledge graph of nine node types and thirty-one edge types, trains a Graph Transformer to score untested drug–disease pairs, and ranks them with a PPO agent. Its validation gate blocks output when model AUC falls below 0.85.',
    href: '/work/drugos',
  },
  {
    q: 'Explain TailGen simply',
    a: 'TailGen learns what market crashes actually look like instead of assuming they are normally distributed, then generates new ones. On the held-out COVID window it breached its 99% VaR on 8 of 35 days against a rolling Gaussian model\'s 12.',
    href: '/work/tailgen',
  },
  {
    q: 'What is AtmosView?',
    a: 'A weather and air-quality platform that aggregates four providers and shows where they disagree instead of averaging them. Researchers can upload their own CSV data and chart it against the API baseline.',
    href: '/work/atmosview',
  },
  {
    q: 'What is his tech stack?',
    a: 'Python, TypeScript, React and Next.js, FastAPI and Express, PyTorch and PyTorch Geometric, PostgreSQL, Neo4j and MongoDB, with Docker, GitHub Actions and pytest in the practice column.',
    href: '/#capabilities',
  },
  {
    q: 'Where does he study?',
    a: 'Atria University, Bengaluru — third year, Digital Transformation with a minor in AI and ML, CGPA 8.1.',
    href: '/#about',
  },
  {
    q: 'How can I contact him?',
    a: `Email ${identity.email}, or call ${identity.phone}. He is also on GitHub at ${identity.githubHandle} and LinkedIn at ${identity.linkedinHandle}.`,
    href: '/#contact',
  },
  {
    q: 'Is he open to internships?',
    a: contact.openTo,
    href: '/#contact',
  },
  {
    q: 'What does not work in his projects?',
    a: 'Each case study ends with a Limitations section written by Manoj. DrugOS reaches test AUC 0.61 against its own 0.85 gate. TailGen ships a FAIL 5/7 certification verdict. AtmosView has no tests and approximates AQI rather than computing it.',
    href: '/work/drugos#limitations',
  },
  {
    q: 'Can I see the code?',
    a: 'Yes — all three repositories are public on GitHub under MANOFHATERS: autonomous-drug-repurposing, tailgen and atmosview-weather.',
    href: identity.github,
  },
  {
    q: 'Can I download his résumé?',
    a: 'Yes. The résumé page has a readable version and a one-page PDF, both generated from the same content as this site.',
    href: '/resume',
  },
  {
    q: 'How was this site built?',
    a: 'Next.js 16 and React 19, statically generated, with Tailwind v4 tokens, one three.js object loaded after the text is readable, and native CSS scroll-driven animation rather than an animation library. The guide runs on Cloudflare Workers AI.',
    href: '/colophon',
  },
];
