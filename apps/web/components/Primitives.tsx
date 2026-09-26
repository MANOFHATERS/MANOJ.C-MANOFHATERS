import type { AnchorHTMLAttributes, ReactNode } from 'react';

/* ── Links ────────────────────────────────────────────────────────────── */

interface InkLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  /** Show a resting hairline underline that turns pigment on hover. */
  resting?: boolean;
  external?: boolean;
}

export function InkLink({
  href,
  children,
  resting = false,
  external = false,
  className = '',
  ...rest
}: InkLinkProps) {
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
  return (
    <a
      href={href}
      className={`ink-link${resting ? ' ink-link--resting' : ''} ${className}`}
      {...externalProps}
      {...rest}
    >
      {children}
    </a>
  );
}

/* ── Figure plate ─────────────────────────────────────────────────────── */

export function FigureCaption({ id, children }: { id: string; children: ReactNode }) {
  return (
    <figcaption className="figure-caption">
      <span className="fig-id">{id}</span>
      <span>{children}</span>
    </figcaption>
  );
}

export function FigurePlate({
  id,
  caption,
  children,
  className = '',
  framed = true,
}: {
  id: string;
  caption: ReactNode;
  children: ReactNode;
  className?: string;
  framed?: boolean;
}) {
  return (
    <figure className={`figure-enter ${className}`}>
      <div className={framed ? 'figure-plate' : ''}>{children}</div>
      <FigureCaption id={id}>{caption}</FigureCaption>
    </figure>
  );
}

/* ── Footnote ─────────────────────────────────────────────────────────── */

/** A superscript reference, set in mono pigment the way a monograph sets one. */
export function FootnoteMark({ n }: { n: number }) {
  return (
    <sup className="mono text-[var(--color-pigment)] text-[0.62em] align-super ml-[0.15em]">
      {n}
    </sup>
  );
}

/* ── Chips ────────────────────────────────────────────────────────────── */

export function StackChips({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-2 gap-y-2 list-none p-0 m-0">
      {items.map((item) => (
        <li
          key={item}
          className="micro border border-[var(--border-subtle)] px-2 py-1.5 text-[var(--text-muted)]"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ── Metric table with provenance ─────────────────────────────────────── */

export interface MetricRow {
  readonly metric: string;
  readonly value: string;
  readonly comparison?: string;
  readonly source: string;
}

export function MetricTable({ rows }: { rows: readonly MetricRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="metric-table">
        <thead>
          <tr>
            <th scope="col" className="w-[42%]">
              Metric
            </th>
            <th scope="col" className="w-[28%]">
              Value
            </th>
            <th scope="col" className="w-[30%]">
              Read from
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric}>
              <td className="pr-6 text-[var(--color-ink)]">{row.metric}</td>
              <td className="pr-6">
                <span className="val">{row.value}</span>
                {row.comparison ? (
                  <span className="block src mt-1 normal-case tracking-normal">
                    {row.comparison}
                  </span>
                ) : null}
              </td>
              <td>
                <span className="src mono">{row.source}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pull quote ───────────────────────────────────────────────────────── */

export function PullQuote({
  text,
  attribution,
}: {
  text: string;
  attribution: string;
}) {
  return (
    <blockquote className="enter my-10 border-l border-[var(--color-pigment)] pl-6 lg:pl-8">
      <p className="text-[length:var(--step-h3)] leading-[1.35] tracking-[-0.01em] text-[var(--color-ink)]">
        {text}
      </p>
      <cite className="micro not-italic block mt-4">— {attribution}</cite>
    </blockquote>
  );
}
