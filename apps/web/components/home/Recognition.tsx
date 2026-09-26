import Link from 'next/link';
import { recognition } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';
import { FigureCaption } from '@/components/Primitives';

/**
 * §02.
 *
 * Deliberately not a "trophy card". The claim is carried by the story of how
 * the work was organised, because that is the part a hiring engineer can
 * actually evaluate. The certificate plate is a placeholder until Manoj
 * supplies the photograph — see CONTENT-TODO.md.
 */
export function Recognition() {
  return (
    <section
      id="recognition"
      data-section="02"
      aria-labelledby="recognition-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="02" />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <p className="micro">{recognition.kicker}</p>
          </div>
        </div>

        <div className="grid12 mt-8 lg:mt-12">
          <div className="col-span-12 lg:col-start-3 lg:col-span-5">
            <h2
              id="recognition-heading"
              className="enter font-[family-name:var(--font-serif)] tracking-[-0.02em]"
              style={{ fontSize: 'var(--step-h1)', lineHeight: 1.02, fontWeight: 350 }}
            >
              {recognition.headline}
            </h2>

            <div className="prose prose-measure enter mt-9">
              {recognition.body.map((para, i) => (
                <p key={i} className={i === 0 ? 'text-[1.06em]' : undefined}>
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-9">
              <Link href="/work/drugos" className="btn btn--pigment">
                Read the DrugOS case study
              </Link>
            </div>
          </div>
        </div>

        {/* Fig. 2.1 — the plate. Until a real photograph or certificate is
            supplied, the space holds the facts rather than a stock image. */}
        <div className="grid12 mt-14">
          <div className="col-span-12 lg:col-start-3 lg:col-span-5">
            <figure className="figure-enter">
              <div className="figure-plate">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="micro mb-2">Team Cosmic</p>
                    <p className="font-[family-name:var(--font-serif)] text-[1.5rem] leading-tight">
                      DrugOS
                    </p>
                    <p className="caption mt-1">
                      Manoj C — originator, architect, project lead
                    </p>
                  </div>
                  <dl className="grid grid-cols-3 gap-x-5 sm:gap-x-7">
                    {[
                      ['4', 'people'],
                      ['2', 'months of spec'],
                      ['547', 'spec citations'],
                    ].map(([v, l]) => (
                      <div key={l}>
                        <dt className="micro mb-1">{l}</dt>
                        <dd className="mono m-0 text-[1.25rem] leading-none">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
              <FigureCaption id={recognition.figure.id}>
                {recognition.figure.caption}
              </FigureCaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
