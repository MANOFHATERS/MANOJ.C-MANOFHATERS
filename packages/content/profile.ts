/**
 * The single source of truth.
 *
 * The home page, the three case studies, the résumé PDF and the Ask Manoj
 * knowledge base are all generated from this file. They cannot disagree with
 * each other, because there is only one of them.
 *
 * Honesty rule (PRD §3): every number on this site carries its provenance.
 * If a fact is not confirmed, it does not appear — see CONTENT-TODO.md.
 */

export interface Link {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export const site = {
  name: 'Manoj C',
  title: 'Manoj C — Full-stack engineer & ML systems, Bengaluru',
  description:
    'Manoj C builds ML systems that state their own limits: a drug-repurposing knowledge graph, a generative tail-risk engine, and a weather platform that shows where its sources disagree.',
  thesis:
    'I build systems that tell the truth, especially when the truth is inconvenient.',
  url: 'https://manojc.vercel.app',
  locale: 'en-IN',
  updated: 'September 2026',
} as const;

export const identity = {
  name: 'Manoj C',
  role: 'Full-stack engineer · ML systems',
  location: 'Bengaluru, Karnataka, India',
  email: 'manoj.c@atriauniversity.edu.in',
  emailHref: 'mailto:manoj.c@atriauniversity.edu.in?subject=Hello%20Manoj',
  phone: '+91 83109 07674',
  phoneHref: 'tel:+918310907674',
  github: 'https://github.com/MANOFHATERS',
  githubHandle: 'github.com/MANOFHATERS',
  linkedin: 'https://www.linkedin.com/in/manoj-c-043264414',
  linkedinHandle: 'linkedin.com/in/manoj-c-043264414',
} as const;

export const standfirst =
  'Full-stack engineer and ML systems builder · 3rd year, Digital Transformation with a minor in AI & ML, Atria University, Bengaluru';

/** §01 — the four facts under the hero, set in mono and separated by hairlines. */
export const proofStrip = [
  { value: '1st place', label: 'DrugOS' },
  { value: 'Selected', label: 'TiE global event' },
  { value: '8.1', label: 'CGPA, Atria University' },
  { value: '3', label: 'systems shipped' },
] as const;

export const education = [
  {
    institution: 'Atria University',
    place: 'Bengaluru',
    detail: 'Digital Transformation, minor in AI & ML',
    note: '3rd year, in progress — CGPA 8.1',
    period: 'Present',
  },
  {
    institution: 'Sri Chaitanya',
    place: '',
    detail: 'Class 12',
    note: '',
    period: '',
  },
  {
    institution: 'Maruthi Vidyalaya',
    place: '',
    detail: 'Class 10',
    note: '',
    period: '',
  },
] as const;

/** §02 — Recognition. Wording is deliberately conservative; see CONTENT-TODO.md. */
export const recognition = {
  kicker: 'Recognition',
  headline: 'Two months. Four people. First place.',
  body: [
    'DrugOS started as research, not as a repository. I spent two months writing the build specification before anyone wrote production code — a numbered engineering contract that assigned a workstream to each of the four of us, myself included, and set the criteria the finished system had to meet.',
    'That document went on to govern the build. It is cited 547 times across source, tests and documentation: 59 citations to the launch-criteria section and 55 to the data-flywheel section alone. When the implementation drifted from the spec, the drift was logged as a numbered defect and fixed back toward the spec — not the other way around.',
    'The work took first place in a college-level competition and was selected for the TiE global event. What I take from it is narrower and more useful: four people, 1,071 commits and 326 branches later, the phases actually connect. That was the specific failure the specification was written to prevent.',
  ],
  figure: {
    id: 'Fig. 2.1',
    caption:
      'Team Cosmic — DrugOS. Manoj C as originator, architect and project lead.',
  },
} as const;

/** §04 — How I work. Three principles, each with its evidence. */
export const principles = [
  {
    n: '01',
    title: 'Fail closed',
    lede: 'When a system does not know, it must refuse — not guess.',
    body: 'In DrugOS a null withdrawal flag is treated as withdrawn, because the alternative is recommending a drug that was pulled from the market. A missing required source raises instead of returning an empty frame. A model AUC below the 0.85 launch bar blocks output rather than shipping it. TailGen carries the same rule into serving: no API keys means 503, not open access; an unavailable model means 503, not a silent downgrade to historical simulation.',
    evidence: 'DrugOS Phase 4 validation gate — TailGen serving semantics',
  },
  {
    n: '02',
    title: 'Specs are contracts',
    lede: 'A document nobody cites is a wish. A document the code cites is a contract.',
    body: 'The DrugOS specification is quoted by section number in the code that satisfies it, so "why is this PostgreSQL and not SQLite?" has an answer with an address rather than a preference. Five versioned contract modules sit at the phase boundaries, imported by both producer and consumer, with CI tests that check each service registers what the contract declares. That mechanism caught a /top-k registered as POST while the contract and the frontend both expected GET — a silent 405 that would otherwise have shipped.',
    evidence: '547 spec citations — 5 contract modules — 10,561 Python tests',
  },
  {
    n: '03',
    title: 'Show the disagreement',
    lede: 'Averaging away a conflict destroys the most useful thing in the data.',
    body: 'AtmosView asks four providers for the same reading and shows all four. A 0.2 °C spread means the models agree; a 3 °C spread means something is stale, and the reader deserves to know which. TailGen goes further and publishes its own certification verdict — FAIL, 5 of 7 gates — on the model it ships, because a validation layer that always says PASS is not a validation layer.',
    evidence: 'AtmosView per-source breakdown — TailGen certification page',
  },
] as const;

/** §05 — Capabilities, grouped by the work that proves them. No skill bars. */
export const capabilities = [
  {
    group: 'Frontend',
    skills: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'HTML', 'CSS', 'JavaScript'],
    proof: 'TailGen platform, four surfaces — DrugOS dashboard, 66 routes — AtmosView',
  },
  {
    group: 'Backend',
    skills: ['Python', 'FastAPI', 'Node.js', 'Express', 'REST design', 'JWT auth'],
    proof: 'All three systems — 39 HTTP endpoints in AtmosView alone',
  },
  {
    group: 'Machine learning',
    skills: [
      'PyTorch',
      'PyTorch Geometric',
      'Graph transformers',
      'Diffusion models',
      'Reinforcement learning (PPO)',
    ],
    proof: 'DrugOS heterogeneous GNN and PPO ranker — TailGen score-based diffusion',
  },
  {
    group: 'Data',
    skills: ['PostgreSQL', 'Neo4j', 'MongoDB', 'Prisma', 'Airflow', 'pandas'],
    proof: 'DrugOS: 13 sources into 9 node and 31 edge types — AtmosView: 5 data models',
  },
  {
    group: 'Engineering practice',
    skills: [
      'Docker',
      'GitHub Actions',
      'pytest',
      'Vitest',
      'Playwright',
      'Contract-driven design',
    ],
    proof: 'DrugOS 10,561 Python tests — TailGen 233 Python and ~193 TypeScript tests',
  },
] as const;

/** §06 — About. First person. */
export const about = {
  figure: {
    id: 'Fig. 0',
    caption: 'Manoj C, Bengaluru, 2026.',
    src: '/manoj.jpg',
  },
  paragraphs: [
    'I am in my third year at Atria University in Bengaluru, reading Digital Transformation with a minor in AI and ML. I build whole systems rather than notebooks: the pipeline that cleans the data, the model that learns from it, the API that serves it, and the interface a person actually uses.',
    'What interests me is narrower than "machine learning". It is the question of what a system should do when it does not know. Most of the work in DrugOS, TailGen and AtmosView sits in that question — dead-lettering a malformed row with a reason code instead of dropping it, treating an unknown safety flag as unsafe, publishing a failing certification verdict instead of quietly re-running until it passes.',
    'I am looking for engineering work where that instinct is an asset rather than an inconvenience.',
  ],
} as const;

/** §07 — the four chips in the empty state of the chat panel. */
export const suggestedQuestions = [
  'What did Manoj win with DrugOS?',
  'Explain TailGen simply',
  'What is his tech stack?',
  'How can I contact him?',
] as const;

/** §08 — Contact. */
export const contact = {
  lede: 'I read everything that arrives here.',
  openTo:
    'Open to engineering internships now and full-time work from graduation — ML systems or full-stack, in Bengaluru or remote.',
} as const;

export const colophon = {
  note: 'Built by Manoj C. Hosted for ₹0.',
  typefaces: [
    {
      name: 'Newsreader',
      by: 'Production Type',
      use: 'Display and long-form text. Variable, with an optical-size axis from 6 to 72, so headlines set delicate and body text sets sturdy.',
      href: 'https://fonts.google.com/specimen/Newsreader',
    },
    {
      name: 'Switzer',
      by: 'Indian Type Foundry, via Fontshare',
      use: 'Interface, labels and navigation. A Swiss neo-grotesk in the Helvetica and Univers lineage — deliberately not Inter.',
      href: 'https://www.fontshare.com/fonts/switzer',
    },
    {
      name: 'JetBrains Mono',
      by: 'JetBrains',
      use: 'Every number on this site. Tabular figures, so columns of metrics line up; the largest x-height of any mono, so labels hold up at 11 pixels.',
      href: 'https://www.jetbrains.com/lp/mono/',
    },
  ],
  stack: [
    ['Framework', 'Next.js 16, React 19, TypeScript. Every route statically generated.'],
    ['Styling', 'Tailwind CSS v4, with the design tokens as CSS custom properties.'],
    ['3D', 'three.js with React Three Fiber v9. One object, loaded after the text is readable.'],
    ['Motion', 'Native CSS scroll-driven animations. No animation library in the bundle.'],
    ['API', 'Cloudflare Workers with Hono, and Workers AI for the guide.'],
    ['Data', 'Neon Postgres. Chat transcripts for 90 days, then deleted.'],
    ['Hosting', 'Vercel Hobby for the site, Cloudflare Workers for the API.'],
    ['Résumé', '@react-pdf/renderer, generated from this same content file at build time.'],
  ] as ReadonlyArray<readonly [string, string]>,
  privacy: [
    'No cookies. No third-party trackers. No fingerprinting.',
    'Your IP address is never stored. Rate limiting uses a SHA-256 hash of it with a salt that changes every day, so you cannot be followed from one day to the next.',
    'Chat transcripts are kept for 90 days so the guide can be improved, then deleted automatically by a scheduled job.',
    'Link events — résumé downloads, email clicks — are counted without anything that identifies you.',
  ],
} as const;

export const navigation: readonly Link[] = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Résumé', href: '/resume' },
];

export const socialLinks: readonly Link[] = [
  { label: 'GitHub', href: identity.github, external: true },
  { label: 'LinkedIn', href: identity.linkedin, external: true },
];
