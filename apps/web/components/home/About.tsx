import { about, education } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';
import { FigureCaption } from '@/components/Primitives';
import { Portrait } from '@/components/Portrait';

/** §06. */
export function About() {
  return (
    <section
      id="about"
      data-section="06"
      aria-labelledby="about-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6 mb-12">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="06" />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <h2 id="about-heading" className="micro">
              About
            </h2>
          </div>
        </div>

        <div className="grid12 gap-y-12">
          <figure className="figure-enter col-span-12 sm:col-span-6 lg:col-span-3">
            <Portrait src={about.figure.src} alt="Manoj C" />
            <FigureCaption id={about.figure.id}>{about.figure.caption}</FigureCaption>
          </figure>

          <div className="col-span-12 lg:col-start-5 lg:col-span-6">
            <div className="prose prose-measure enter">
              {about.paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? 'text-[1.08em] leading-[1.58]' : undefined}>
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="micro mb-5">Education</h3>
              <ol className="m-0 list-none p-0">
                {education.map((e) => (
                  <li
                    key={e.institution}
                    className="border-t border-[var(--color-rule)] py-4"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <span className="font-[family-name:var(--font-serif)] text-[1.1rem]">
                        {e.institution}
                        {e.place ? (
                          <span className="text-[var(--color-graphite)]">, {e.place}</span>
                        ) : null}
                      </span>
                      {e.period ? <span className="micro">{e.period}</span> : null}
                    </div>
                    <p className="caption mt-1">
                      {e.detail}
                      {e.note ? ` — ${e.note}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
