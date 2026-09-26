import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { site } from '@manoj/content/profile';
import { nextProject, projectBySlug, projects } from '@manoj/content/projects';
import { Rule, SectionMark } from '@/components/Section';
import {
  FigureCaption,
  InkLink,
  MetricTable,
  PullQuote,
  StackChips,
} from '@/components/Primitives';
import { AskButton, RepoLink } from '@/components/TrackedLinks';
import { SpecimenInline } from '@/components/specimen/Specimen';
import { ArrowNE, ArrowSwap } from '@/components/Icons';
import { DrugOSDiagram } from '@/components/diagrams/DrugOSDiagram';
import { TailGenDiagram } from '@/components/diagrams/TailGenDiagram';
import { AtmosViewDiagram } from '@/components/diagrams/AtmosViewDiagram';
import { CaseStudyToc } from '@/components/motion/CaseStudyToc';
import { DrawOnView } from '@/components/motion/DrawOnView';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  const description = project.tagline.slice(0, 155);
  return {
    title: project.fullName,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.fullName} — Manoj C`,
      description,
      url: `${site.url}/work/${project.slug}`,
      type: 'article',
    },
  };
}

const DIAGRAMS = {
  drugos: DrugOSDiagram,
  tailgen: TailGenDiagram,
  atmosview: AtmosViewDiagram,
} as const;

/** A small numbered heading, hanging its own mark the way the home page does. */
function Head({
  n,
  id,
  children,
}: {
  n: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid12 mb-8">
      <div className="col-span-3 lg:col-span-2">
        <span className="mono text-[var(--step-micro)] tracking-[0.06em] text-[var(--color-pigment)]">
          {n}
        </span>
      </div>
      <div className="col-span-9 lg:col-span-8">
        <h2
          id={id}
          className="font-[family-name:var(--font-serif)] tracking-[-0.015em]"
          style={{ fontSize: 'var(--step-h3)', lineHeight: 1.2 }}
        >
          {children}
        </h2>
      </div>
    </div>
  );
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();

  const Diagram = DIAGRAMS[p.slug];
  const next = nextProject(p.slug);

  /* The TOC rail (Motion PRD 10.6): the study's sections, inked as the
     reader passes them, gliding under Lenis. */
  const TOC = [
    { id: 'abstract', label: 'Abstract' },
    { id: 'problem', label: 'Problem' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'hard-problems', label: 'Hard problems' },
    { id: 'results', label: 'Results' },
    { id: 'limitations', label: 'Limitations' },
    { id: 'next', label: 'What’s next' },
  ] as const;

  return (
    <article>
      <CaseStudyToc items={TOC} />
      {/* ── Header plate ─────────────────────────────────────────────── */}
      <header className="shell pt-[calc(var(--masthead-h)+3rem)] lg:pt-[calc(var(--masthead-h)+5rem)]">
        <div className="grid12 items-start gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <div className="mb-7 flex items-baseline gap-4">
              <span className="mono text-[var(--step-micro)] tracking-[0.06em] text-[var(--color-pigment)]">
                §03.{p.index}
              </span>
              <Link href="/#work" className="micro ink-link">
                Selected work
              </Link>
            </div>

            <h1
              className="font-[family-name:var(--font-serif)] tracking-[-0.025em] type-set-line"
              style={{
                fontSize: 'clamp(2.5rem, 1.4rem + 4vw, 4.5rem)',
                lineHeight: 1,
                fontWeight: 350,
              }}
            >
              {/* The title rises through its clip mask on arrival (T3's
                  spirit): the typographic hand-off between pages. */}
              <span>{p.name}</span>
            </h1>

            <p className="lede mt-6 max-w-[38ch] font-[family-name:var(--font-sans)]">
              {p.tagline}
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {[
                ['Role', p.role],
                ['Team', p.team],
                ['Year', p.year],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-[var(--color-rule)] pt-3">
                  <dt className="micro mb-1.5">{k}</dt>
                  <dd className="m-0 text-[0.95rem] leading-snug">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-9">
              <p className="micro mb-3">Stack</p>
              <StackChips items={p.stack} />
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <RepoLink href={p.repo} className="btn btn--pigment" data-magnetic data-cursor="view">
                View source on GitHub
                <ArrowNE size={13} />
              </RepoLink>
              <AskButton question={p.askPrompt} className="btn" data-cursor="ask">
                Ask about this project
              </AskButton>
            </div>
          </div>

          {/* case-header-plate is the T2 destination: the morph target
              for the shared-specimen transition from the work index. */}
          <figure className="col-span-12 lg:col-start-8 lg:col-span-5">
            <div className="case-header-plate relative aspect-square w-full border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
              <SpecimenInline state={p.specimen} className="absolute inset-0" />
            </div>
            <FigureCaption
              id={p.specimen === 'graph' ? 'Fig. 1.3' : p.specimen === 'tail' ? 'Fig. 2.3' : 'Fig. 3.3'}
            >
              {p.specimen === 'graph'
                ? 'The specimen in its first state — the DrugOS knowledge graph. The pigment route is illustrative, not a model prediction.'
                : p.specimen === 'tail'
                  ? 'The specimen in its second state — a histogram of daily returns. The pigment nodes are the left tail; the dashed curve is the Gaussian.'
                  : 'The specimen in its third state — four provider layers over India, offset from one another by their disagreement.'}
            </FigureCaption>
          </figure>
        </div>
      </header>

      {/* ── Abstract ─────────────────────────────────────────────────── */}
      <section className="section" aria-labelledby="abstract-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="01" id="abstract-h">
            Abstract
          </Head>
          <div className="grid12">
            <div className="col-span-12 lg:col-start-3 lg:col-span-7">
              <div className="prose prose-measure enter">
                {p.abstract.map((para, i) => (
                  <p key={i} className={i === 0 ? 'text-[1.08em] leading-[1.58]' : undefined}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────────────── */}
      <section id="problem" className="section" aria-labelledby="problem-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="02" id="problem-h">
            {p.problem.heading}
          </Head>
          <div className="grid12">
            <div className="col-span-12 lg:col-start-3 lg:col-span-7">
              <div className="prose prose-measure enter">
                {p.problem.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {p.problem.pullquote ? (
                <PullQuote
                  text={p.problem.pullquote.text}
                  attribution={p.problem.pullquote.attribution}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────────────── */}
      <section id="architecture" className="section" aria-labelledby="arch-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="03" id="arch-h">
            Architecture
          </Head>

          {/* The diagram builds the system in front of the reader: paths
              draw in sequence, staggered 80ms on the draw curve (10.7). */}
          <figure className="figure-enter mb-14">
            <div className="figure-plate overflow-x-auto">
              <DrawOnView className="min-w-[760px]">
                <Diagram />
              </DrawOnView>
            </div>
            <FigureCaption id={p.architecture.figure}>
              {p.architecture.caption}
            </FigureCaption>
          </figure>

          <div className="grid12">
            <div className="col-span-12 lg:col-start-3 lg:col-span-7">
              <div className="prose prose-measure enter">
                {p.architecture.walkthrough.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three hard problems ──────────────────────────────────────── */}
      <section id="hard-problems" className="section" aria-labelledby="hard-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="04" id="hard-h">
            Three hard problems
          </Head>

          <ol className="hard-problems enter-stagger m-0 list-none p-0">
            {p.hardProblems.map((hp, i) => (
              <li
                key={hp.title}
                className="grid12 border-t border-[var(--color-rule)] py-10 lg:py-14"
              >
                <div className="col-span-12 lg:col-span-3">
                  <p className="mono mb-3 text-[var(--step-micro)] text-[var(--color-pigment)]">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3
                    className="font-[family-name:var(--font-serif)] tracking-[-0.01em]"
                    style={{ fontSize: '1.3rem', lineHeight: 1.2 }}
                  >
                    {hp.title}
                  </h3>
                </div>

                <div className="col-span-12 mt-6 lg:col-start-5 lg:col-span-7 lg:mt-0">
                  <dl className="m-0">
                    {[
                      ['Problem', hp.problem],
                      ['Decision', hp.decision],
                      ['Result', hp.result],
                    ].map(([k, v]) => (
                      <div key={k} className="mb-6 last:mb-0">
                        <dt className="micro mb-2">{k}</dt>
                        <dd className="prose-measure m-0 text-[0.99em] leading-[1.62]">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────────── */}
      <section id="results" className="section" aria-labelledby="results-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="05" id="results-h">
            Results, with provenance
          </Head>

          <div className="grid12">
            <div className="col-span-12 lg:col-start-3 lg:col-span-9">
              <p className="caption mb-7 max-w-[52ch]">
                Every number below names the run, artifact or file it was read
                from. A metric without a source is an opinion.
              </p>

              <figure className="figure-enter">
                <MetricTable rows={p.results.rows} />
                <FigureCaption id={p.results.figure}>
                  {p.results.caption}
                </FigureCaption>
              </figure>

              {p.results.note ? (
                <div className="mt-10 border-l border-[var(--color-pigment)] bg-[var(--color-paper-raised)] py-5 pl-6 pr-5">
                  <p className="micro mb-2.5">Reading it honestly</p>
                  <p className="prose-measure text-[0.97em] leading-[1.6]">
                    {p.results.note}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ── Limitations ──────────────────────────────────────────────── */}
      <section id="limitations" className="section" aria-labelledby="lim-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="06" id="lim-h">
            Limitations
          </Head>

          <div className="grid12">
            <div className="col-span-12 lg:col-start-3 lg:col-span-7">
              <p className="caption mb-7 max-w-[48ch]">
                Written by Manoj, not discovered by a reviewer. Volunteering
                these is the whole positioning of this site.
              </p>
              <ul className="m-0 list-none p-0">
                {p.limitations.map((l, i) => (
                  <li
                    key={i}
                    className="flex gap-4 border-t border-[var(--color-rule)] py-5"
                  >
                    <span className="mono flex-none pt-0.5 text-[var(--step-micro)] text-[var(--color-graphite)]">
                      L{i + 1}
                    </span>
                    <span className="text-[0.99em] leading-[1.62]">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── What I would do next ─────────────────────────────────────── */}
      <section id="next" className="section" aria-labelledby="next-h">
        <div className="shell">
          <Rule />
          <div className="mt-8" />
          <Head n="07" id="next-h">
            What I would do next
          </Head>

          <div className="grid12">
            <div className="col-span-12 lg:col-start-3 lg:col-span-7">
              <ol className="enter-stagger m-0 list-none p-0">
                {p.next.map((n, i) => (
                  <li
                    key={i}
                    className="flex gap-5 border-t border-[var(--color-rule)] py-6"
                  >
                    <span className="mono flex-none pt-1 text-[var(--step-micro)] text-[var(--color-pigment)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[1.02em] leading-[1.58]">{n}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer of the case study ─────────────────────────────── */}
      <section className="shell pb-8">
        <Rule tone="ink" />
        <div className="grid12 mt-10 gap-y-10">
          <div className="col-span-12 lg:col-span-5">
            <p className="micro mb-3">Source</p>
            <RepoLink href={p.repo} className="ink-link mono text-[0.9rem] break-all">
              {p.repoLabel}
            </RepoLink>
            <div className="mt-6">
              <AskButton question={p.askPrompt} className="btn btn--quiet" data-cursor="ask">
                Ask about this project
              </AskButton>
            </div>
          </div>

          <div className="col-span-12 lg:col-start-8 lg:col-span-5">
            <p className="micro mb-3">Next</p>
            {/* The next-project link runs T3: the quiet typographic
                hand-off between two long-form pages. */}
            <Link href={`/work/${next.slug}`} className="group block" data-cursor="read">
              <span
                className="font-[family-name:var(--font-serif)] tracking-[-0.02em]"
                style={{ fontSize: 'var(--step-h2)', lineHeight: 1.05, fontWeight: 350 }}
              >
                <span className="bg-[linear-gradient(var(--color-pigment),var(--color-pigment))] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-base)] ease-[var(--ease-draw)] group-hover:bg-[length:100%_1px]">
                  {next.name}
                </span>
              </span>
              <span className="caption mt-3 flex max-w-[34ch] items-center gap-2">
                <ArrowSwap direction="e" size={13} className="text-[var(--text-muted)] group-hover:text-[var(--action)]" />
                {next.tagline}
              </span>
            </Link>
          </div>
        </div>

        <p className="micro mt-14">
          <InkLink href="/#work">← All work</InkLink>
        </p>
      </section>
    </article>
  );
}
