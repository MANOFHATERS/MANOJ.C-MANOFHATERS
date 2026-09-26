import Link from 'next/link';
import { projects } from '@manoj/content/projects';
import { SectionMark, Rule } from '@/components/Section';
import { SpecimenInline } from '@/components/specimen/Specimen';
import { ArrowSwap } from '@/components/Icons';

/**
 * §03.
 *
 * An index, not a card grid. Each project is a row in a printed contents
 * page: number, title, role, year, the line that explains it, and one metric.
 * Scrolling through the three rows is what drives the specimen through its
 * three states on desktop — the object and the index are reading the same
 * scroll position.
 */
export function SelectedWork() {
  return (
    <section
      id="work"
      data-section="03"
      aria-labelledby="work-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6 mb-12">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="03" />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <h2 id="work-heading" className="micro">
              Selected work
            </h2>
          </div>
        </div>

        <ol className="m-0 list-none p-0">
          {projects.map((p, i) => (
            <li
              key={p.slug}
              data-specimen={p.specimen}
              className="border-t border-[var(--color-rule)] first:border-t-0"
            >
              <Link
                href={`/work/${p.slug}`}
                className="group block py-10 lg:py-16 transition-colors duration-[var(--dur-base)]"
              >
                <div className="grid12">
                  <div className="col-span-2 lg:col-span-2">
                    <span className="mono text-[var(--step-micro)] text-[var(--color-graphite)] transition-colors duration-[var(--dur-quick)] group-hover:text-[var(--color-pigment)]">
                      {p.index}
                    </span>
                  </div>

                  <div className="col-span-10 lg:col-span-5">
                    <h3
                      className="font-[family-name:var(--font-serif)] tracking-[-0.02em]"
                      style={{
                        fontSize: 'var(--step-h2)',
                        lineHeight: 1.05,
                        fontWeight: 350,
                      }}
                    >
                      <span className="bg-[linear-gradient(var(--color-pigment),var(--color-pigment))] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat pb-1 transition-[background-size] duration-[var(--dur-base)] ease-[var(--ease-draw)] group-hover:bg-[length:100%_1px]">
                        {p.name}
                      </span>
                    </h3>

                    <p className="prose-measure mt-5 text-[0.97em] leading-[1.55] text-[var(--text-secondary)]">
                      {p.tagline}
                    </p>

                    <div className="mt-7 flex items-baseline gap-4">
                      <span className="mono text-[1.6rem] leading-none text-[var(--color-ink)]">
                        {p.headline.value}
                      </span>
                      <span className="micro normal-case tracking-[0.04em]">
                        {p.headline.label}
                      </span>
                    </div>
                  </div>

                  {/* On phones each row carries its own still of the state the
                      specimen would take. On desktop the rail does it live. */}
                  <div className="col-span-12 mt-8 lg:hidden">
                    <div className="relative aspect-[4/3] w-full border border-[var(--color-rule)] bg-[var(--color-paper-raised)]">
                      <SpecimenInline
                        state={p.specimen}
                        ssrStill={false}
                        className="absolute inset-0"
                      />
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-start-8 lg:col-span-3 lg:flex lg:items-end">
                    <div className="w-full">
                      <p className="caption mt-3 lg:mt-0 lg:text-right font-[family-name:var(--font-mono)] text-[var(--step-micro)] uppercase tracking-[0.06em] lg:whitespace-nowrap">
                        {p.role} · {p.team}
                      </p>
                      <p className="mono text-[var(--step-micro)] text-[var(--text-muted)] lg:text-right mt-1.5">
                        {p.year}
                      </p>
                    </div>
                  </div>

                  {/* The drawn arrow at the last column. It swaps along its
                      own axis on hover — the site’s signature micro-move. */}
                  <div className="hidden lg:col-start-12 lg:col-span-1 lg:flex lg:items-end lg:justify-end">
                    <ArrowSwap direction="ne" size={15} className="text-[var(--text-muted)] group-hover:text-[var(--action)]" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
