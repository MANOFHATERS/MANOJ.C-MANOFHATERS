import type { SVGProps } from 'react';

/**
 * The drawn arrow system (PRD Ch. 7).
 *
 * Switzer, Newsreader and JetBrains Mono ship no → / ↗ glyphs at all
 * (verified against the served woff2 cmaps), so typographic arrows fall
 * back to system fonts and render at the wrong weight on every OS. The
 * arrows are therefore drawn: 24×24 viewBox, 1.5px stroke, butt caps,
 * miter joins — the compact-corner geometry class Awwwards winners ship.
 *
 * Grammar, fixed across the site:
 *   ArrowNE  — the link leaves the site
 *   ArrowE   — internal navigation / CTA
 *   ArrowS   — downward motion within the page (scroll hint, download)
 */

interface ArrowProps extends Omit<SVGProps<SVGSVGElement>, 'direction'> {
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'butt' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true as const,
  focusable: 'false' as const,
});

/** ↗ — the signature glyph. Diagonal + corner polyline, exits top-right. */
export function ArrowNE({ size = 16, ...rest }: ArrowProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

/** → — internal. Horizontal shaft + corner. */
export function ArrowE({ size = 16, ...rest }: ArrowProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 12h15" />
      <path d="M14 7l5 5-5 5" />
    </svg>
  );
}

/** ↓ — scroll / download. Vertical shaft + corner. */
export function ArrowS({ size = 16, ...rest }: ArrowProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 4v15" />
      <path d="M7 14l5 5 5-5" />
    </svg>
  );
}

/**
 * The arrow-swap hover (spec extracted from Lusion's shipped CSS): two
 * stacked arrows in an overflowed box. On hover the first exits along its
 * own 45° axis while the second takes its place. 0.3s, the site curve.
 * The CSS lives in globals.css (.arrow-swap); this wires the two glyphs.
 */
export function ArrowSwap({
  direction = 'ne',
  size = 14,
  className = '',
}: {
  direction?: 'ne' | 'e';
  size?: number;
  className?: string;
}) {
  const Glyph = direction === 'ne' ? ArrowNE : ArrowE;
  return (
    <span className={`arrow-swap ${className}`} aria-hidden="true">
      <Glyph size={size} className="arrow-a" />
      <Glyph size={size} className="arrow-b" />
    </span>
  );
}

/** Copy — for the copy-to-clipboard affordance. 1.5px, sharp terminals. */
export function IconCopy({ size = 14, ...rest }: ArrowProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="9" y="9" width="11" height="11" />
      <path d="M5 15H4V4h11v1" />
    </svg>
  );
}

/** Check — the "Copied" confirmation state. */
export function IconCheck({ size = 14, ...rest }: ArrowProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}
