/**
 * The résumé, derived from the same facts as the site.
 *
 * Both `/resume` and `public/Manoj-C-Resume.pdf` are rendered from this
 * object, so the page and the PDF cannot drift apart — and neither can drift
 * away from the site, because the identity and project facts come from
 * profile.ts and projects.ts.
 *
 * ATS rules (PRD §10): single column, standard headings, real text, no
 * tables for layout, links written out in full.
 */

import { identity, site } from './profile';

export interface ResumeSection {
  readonly heading: string;
  readonly entries: readonly ResumeEntry[];
}

export interface ResumeEntry {
  readonly title: string;
  readonly meta?: string;
  readonly detail?: string;
  readonly bullets?: readonly string[];
}

export const resumeHeader = {
  name: identity.name,
  title: 'Full-stack engineer · ML systems',
  contact: [
    'Bengaluru, India',
    identity.email,
    identity.phone,
    identity.githubHandle,
    identity.linkedinHandle,
  ],
} as const;

export const resumeSummary =
  'Third-year Digital Transformation student (minor in AI & ML) who builds complete ML systems — data pipelines, models, APIs and web interfaces — with a habit of making systems fail safely and report their own limits.';

export const resumeSections: readonly ResumeSection[] = [
  {
    heading: 'Education',
    entries: [
      {
        title: 'Atria University, Bengaluru',
        meta: '3rd year, in progress',
        detail: 'Digital Transformation, minor in AI & ML — CGPA 8.1',
      },
      { title: 'Sri Chaitanya', meta: 'Class 12' },
      { title: 'Maruthi Vidyalaya', meta: 'Class 10' },
    ],
  },
  {
    heading: 'Achievements',
    entries: [
      {
        title: 'First place, college-level competition — DrugOS',
        detail:
          'Selected for the TiE global event. Originator, architect and project lead for a team of four.',
      },
    ],
  },
  {
    heading: 'Projects',
    entries: [
      {
        title: 'DrugOS — Autonomous Drug Repurposing Platform',
        meta: 'Project lead and architect, team of 4',
        bullets: [
          'Designed a four-phase pipeline — ingestion, Neo4j knowledge graph, Graph Transformer, PPO ranker — fusing 13 biomedical sources into 9 node and 31 edge types.',
          'Wrote a two-month build specification that governed the team\'s work; it is cited 547 times across code and tests as acceptance criteria.',
          'Built fail-closed patient-safety gates: an unknown withdrawal status is treated as withdrawn, and output is blocked when model AUC falls below the 0.85 launch bar.',
        ],
      },
      {
        title: 'TailGen — Generative Tail-Risk Engine',
        meta: 'Solo',
        bullets: [
          'Built a score-based diffusion model (Diffusion Transformer, 541K parameters) in PyTorch that generates market scenarios with realistic fat tails — Hill alpha 2.51 against a real 2.66.',
          'On the held-out COVID window, 99% VaR breaches fell to 8 of 35 days against 12 for rolling Gaussian VaR, while pricing the 1% tail 28% wider.',
          'Shipped a FastAPI service, a SHA-256-verified model registry with human-gated promotion, and a four-surface Next.js platform. 233 Python tests check the mathematics; the platform publishes its own certification verdict — FAIL, 5 of 7 gates.',
        ],
      },
      {
        title: 'AtmosView — Weather & Air-Quality Intelligence',
        meta: 'Solo',
        bullets: [
          'Built a React and Node/Express platform aggregating four weather and AQI providers across 39 endpoints, showing where they disagree rather than averaging them away.',
          'Implemented per-provider graceful degradation across four layers, so a dead upstream costs one row of a breakdown table rather than the page.',
          'Added JWT auth with a researcher role and a CSV pipeline whose header detection tolerates real provider export files.',
        ],
      },
    ],
  },
];

export const resumeSkills: ReadonlyArray<readonly [string, string]> = [
  ['Languages', 'Python, TypeScript, JavaScript, SQL, HTML, CSS'],
  ['Frontend', 'React, Next.js, Tailwind CSS'],
  ['Backend', 'FastAPI, Node.js, Express, REST design, JWT'],
  ['Machine learning', 'PyTorch, PyTorch Geometric, diffusion models, reinforcement learning (PPO)'],
  ['Data', 'PostgreSQL, Neo4j, MongoDB, Prisma, Airflow, pandas'],
  ['Tools', 'Docker, GitHub Actions, pytest, Vitest, Playwright'],
];

export const resumeFooter = `Updated ${site.updated} · ${site.url.replace('https://', '')}`;
