import { capabilities } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';

/**
 * §05.
 *
 * Grouped by the work that proves them, with no percentage anywhere. A skill
 * bar claims a precision nobody has about themselves; "proven in" can be
 * checked by opening the repository.
 */
export function Capabilities() {
  return (
    <section
      id="capabilities"
      data-section="05"
      aria-labelledby="cap-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6 mb-10">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="05" />
          </div>
          <div className="col-span-9 lg:col-span-6">
            <h2 id="cap-heading" className="micro">
              Capabilities
            </h2>
            <p className="caption mt-3 max-w-[46ch]">
              Grouped by the project that proves them, because a percentage on a
              bar is a number nobody can check.
            </p>
          </div>
        </div>

        <dl className="m-0">
          {capabilities.map((c) => (
            <div
              key={c.group}
              className="grid12 border-t border-[var(--color-rule)] py-7 lg:py-9"
            >
              <dt className="col-span-12 lg:col-span-3">
                <span className="font-[family-name:var(--font-serif)] text-[1.2rem] tracking-[-0.01em]">
                  {c.group}
                </span>
              </dt>
              <dd className="col-span-12 m-0 mt-3 lg:col-span-6 lg:mt-0">
                <ul className="flex flex-wrap gap-x-1.5 gap-y-2 p-0 m-0 list-none">
                  {c.skills.map((s) => (
                    <li
                      key={s}
                      className="ui border border-[var(--color-rule)] px-2.5 py-1 text-[var(--step-caption)] text-[var(--color-ink)]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </dd>
              <dd className="col-span-12 m-0 mt-4 lg:col-span-3 lg:mt-0">
                <p className="micro normal-case tracking-[0.03em] leading-[1.6]">
                  {c.proof}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
