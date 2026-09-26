import { principles } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';

/**
 * §04. Three principles, each with the evidence that earns it.
 *
 * Every claim here points at something checkable in a repository. A principle
 * without evidence is a slogan, and slogans are the thing this site is
 * trying not to be.
 */
export function HowIWork() {
  return (
    <section
      id="how-i-work"
      data-section="04"
      aria-labelledby="how-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6 mb-12">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="04" />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <h2 id="how-heading" className="micro">
              How I work
            </h2>
          </div>
        </div>

        <div className="space-y-0">
          {principles.map((p) => (
            <article
              key={p.n}
              className="grid12 border-t border-[var(--color-rule)] py-10 lg:py-14"
            >
              <div className="col-span-12 lg:col-span-4">
                <p className="mono mb-3 text-[var(--step-micro)] text-[var(--color-pigment)]">
                  {p.n}
                </p>
                <h3
                  className="font-[family-name:var(--font-serif)] tracking-[-0.015em]"
                  style={{ fontSize: 'var(--step-h3)', lineHeight: 1.15 }}
                >
                  {p.title}
                </h3>
                <p className="mt-3 max-w-[26ch] text-[0.95em] italic leading-[1.5] text-[var(--color-graphite)]">
                  {p.lede}
                </p>
              </div>

              <div className="col-span-12 mt-6 lg:col-start-6 lg:col-span-6 lg:mt-0">
                <p className="prose-measure text-[0.99em] leading-[1.62]">{p.body}</p>
                <p className="micro mt-6 normal-case tracking-[0.04em]">
                  <span className="text-[var(--color-pigment)]">Evidence — </span>
                  {p.evidence}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
