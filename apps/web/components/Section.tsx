import type { ReactNode } from 'react';

/**
 * A numbered section, the way a monograph numbers them.
 *
 * The § device is not ornament. Manoj's DrugOS specification governed a
 * four-person build through numbered sections, cited 547 times in that
 * codebase; the site borrows the convention because it is his, not because
 * it is decorative.
 */

interface SectionProps {
  /** Two digits, e.g. "03". Rendered as §03. */
  mark: string;
  id: string;
  title: string;
  /** Shown beside the § mark instead of the heading, when the heading is set large. */
  kicker?: string;
  children: ReactNode;
  /** Hide the visible heading but keep it for screen readers. */
  headingHidden?: boolean;
  className?: string;
}

export function SectionMark({
  mark,
  label,
  hanging = false,
}: {
  mark: string;
  label?: string;
  hanging?: boolean;
}) {
  return (
    <span
      className={`section-mark${hanging ? ' section-mark--hanging' : ''}`}
      data-mark={mark}
      aria-hidden="true"
    >
      <span className="mark-glyph">§</span>
      <span>{mark}</span>
      {label ? <span className="ml-2 tracking-[0.08em] uppercase">{label}</span> : null}
    </span>
  );
}

export function Rule({
  tone = 'default',
  draw = true,
  className = '',
}: {
  tone?: 'default' | 'ink' | 'pigment';
  draw?: boolean;
  className?: string;
}) {
  const toneClass =
    tone === 'ink' ? ' rule--ink' : tone === 'pigment' ? ' rule--pigment' : '';
  return (
    <hr
      className={`rule${toneClass}${draw ? ' rule--draw' : ''} ${className}`}
      aria-hidden="true"
    />
  );
}

export function Section({
  mark,
  id,
  title,
  kicker,
  children,
  headingHidden = false,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      data-section={mark}
      aria-labelledby={`${id}-heading`}
      className={`section ${className}`}
    >
      <div className="shell">
        <Rule />
        <header className="grid12 mt-6 mb-10 lg:mb-16">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark={mark} />
          </div>
          <div className="col-span-9 lg:col-span-10">
            <h2
              id={`${id}-heading`}
              className={
                headingHidden
                  ? 'sr-only'
                  : 'text-[length:var(--step-h3)] font-normal tracking-[-0.01em]'
              }
            >
              {kicker ?? title}
            </h2>
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}
