import type { Metadata } from 'next';
import {
  resumeFooter,
  resumeHeader,
  resumeSections,
  resumeSkills,
  resumeSummary,
} from '@manoj/content/resume';
import { identity } from '@manoj/content/profile';
import { Rule } from '@/components/Section';
import { ResumeLink } from '@/components/TrackedLinks';
import { CopyButton } from '@/components/CopyButton';

export const metadata: Metadata = {
  title: 'Résumé',
  description:
    'Manoj C — full-stack engineer and ML systems builder, Bengaluru. Education, achievements, three shipped systems and skills. One-page PDF available.',
  alternates: { canonical: '/resume' },
};

/**
 * The same content as the PDF, set for the screen.
 *
 * Both are generated from packages/content/resume.ts, so this page and the
 * download cannot disagree — and Ctrl/Cmd+P here produces a clean A4 page
 * through the print stylesheet in globals.css.
 */
export default function Resume() {
  return (
    <article className="shell pt-[calc(var(--masthead-h)+3rem)] pb-24 lg:pt-[calc(var(--masthead-h)+5rem)]">
      <div className="grid12">
        <div className="col-span-12 lg:col-start-3 lg:col-span-8">
          {/* Masthead of the document itself */}
          <header className="mb-10">
            <div className="mb-6 flex items-baseline gap-4">
              <span className="micro">Résumé</span>
            </div>

            <h1
              className="font-[family-name:var(--font-serif)] tracking-[-0.025em]"
              style={{
                fontSize: 'clamp(2.5rem, 1.6rem + 3.4vw, 4rem)',
                lineHeight: 1,
                fontWeight: 350,
              }}
            >
              {resumeHeader.name}
            </h1>
            <p className="ui mt-3 text-[1.05rem] text-[var(--color-graphite)]">
              {resumeHeader.title}
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 p-0 m-0 list-none">
              {resumeHeader.contact.map((c) => (
                <li key={c} className="mono text-[0.8rem] text-[var(--color-graphite)]">
                  {c}
                </li>
              ))}
            </ul>

            <div className="no-print mt-7 flex flex-wrap gap-3">
              <ResumeLink className="btn btn--pigment">Download PDF</ResumeLink>
              <CopyButton value={identity.email} label="Copy email" event="email_copy" />
            </div>
          </header>

          <section className="mb-10">
            <h2 className="micro mb-3">Summary</h2>
            <p className="prose-measure text-[1.0em] leading-[1.6]">{resumeSummary}</p>
          </section>

          {resumeSections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="micro mb-4 border-b border-[var(--color-ink)] pb-2">
                {section.heading}
              </h2>

              <ol className="m-0 list-none p-0">
                {section.entries.map((entry) => (
                  <li key={entry.title} className="mb-7 last:mb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3
                        className="font-[family-name:var(--font-serif)]"
                        style={{ fontSize: '1.15rem', lineHeight: 1.25 }}
                      >
                        {entry.title}
                      </h3>
                      {entry.meta ? <span className="micro">{entry.meta}</span> : null}
                    </div>

                    {entry.detail ? (
                      <p className="caption mt-1.5">{entry.detail}</p>
                    ) : null}

                    {entry.bullets ? (
                      <ul className="mt-3 m-0 list-none p-0">
                        {entry.bullets.map((b, i) => (
                          <li key={i} className="flex gap-3 py-1.5">
                            <span
                              aria-hidden="true"
                              className="mt-[0.62em] h-px w-3 flex-none bg-[var(--color-pigment)]"
                            />
                            <span className="text-[0.96em] leading-[1.55]">{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ))}

          <section className="mb-10">
            <h2 className="micro mb-4 border-b border-[var(--color-ink)] pb-2">
              Skills
            </h2>
            <dl className="m-0">
              {resumeSkills.map(([group, list]) => (
                <div
                  key={group}
                  className="flex flex-col gap-1 border-b border-[var(--color-rule)] py-3 last:border-0 sm:flex-row sm:gap-6"
                >
                  <dt className="micro w-[10rem] flex-none pt-0.5">{group}</dt>
                  <dd className="m-0 text-[0.95em] leading-[1.5]">{list}</dd>
                </div>
              ))}
            </dl>
          </section>

          <Rule />
          <p className="micro mt-5">{resumeFooter}</p>
        </div>
      </div>
    </article>
  );
}
