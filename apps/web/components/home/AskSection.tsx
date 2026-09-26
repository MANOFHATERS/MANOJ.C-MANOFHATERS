import { suggestedQuestions } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';
import { AskButton } from '@/components/TrackedLinks';

/** §07. The invitation. The panel itself lives in the layout. */
export function AskSection() {
  return (
    <section
      id="ask"
      data-section="07"
      aria-labelledby="ask-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6 mb-10">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="07" />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <h2 id="ask-heading" className="micro">
              Ask Manoj
            </h2>
          </div>
        </div>

        <div className="grid12">
          <div className="col-span-12 lg:col-start-3 lg:col-span-6">
            <p
              className="enter font-[family-name:var(--font-serif)] tracking-[-0.02em]"
              style={{ fontSize: 'var(--step-h2)', lineHeight: 1.1, fontWeight: 350 }}
            >
              There is a guide to this site that answers questions about Manoj —
              and declines everything else.
            </p>

            <p className="prose-measure enter mt-7 text-[var(--color-graphite)]">
              It reads only what is written on these pages, cites the section it
              answered from, and says so plainly when a fact is not here rather
              than inventing one. Ask it about the architecture of any of the
              three systems, or about what does not work in them.
            </p>

            <ul className="enter-stagger mt-9 flex flex-wrap gap-2 p-0 m-0 list-none">
              {suggestedQuestions.map((q) => (
                <li key={q}>
                  <AskButton question={q} className="btn btn--quiet">
                    {q}
                  </AskButton>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <AskButton className="btn btn--pigment">Open the guide</AskButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
