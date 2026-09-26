import Link from 'next/link';
import { Rule } from '@/components/Section';
import { AskButton } from '@/components/TrackedLinks';

/**
 * "This page failed closed."
 *
 * The joke is the whole site's argument: when a system does not know, it
 * refuses rather than guesses. A 404 is that rule applied to a URL.
 *
 * The one flourish (Motion PRD 15.4): the "404" numeral set in the
 * specimen's node constellation — dots on a grid, drawing in on entry,
 * a few positions in pigment. The site's argument, rendered even in
 * its refusal to guess.
 */

/* 5×7 dot-matrix glyphs. Pigment marks a few positions per digit —
   meaning, not decoration: the positions the specimen's hero path
   would occupy. */
const GLYPHS: Record<'4' | '0', boolean[][]> = {
  '4': [
    [false, false, false, true, false],
    [false, false, true, true, false],
    [false, true, false, true, false],
    [true, false, false, true, false],
    [true, true, true, true, true],
    [false, false, false, true, false],
    [false, false, false, true, false],
  ],
  '0': [
    [false, true, true, true, false],
    [true, false, false, false, true],
    [true, false, true, false, true],
    [true, false, false, true, true],
    [true, false, false, false, true],
    [true, false, false, false, true],
    [false, true, true, true, false],
  ],
};

/* Which dots carry pigment — the "hero path" through each numeral. */
const PIGMENT: Record<'4' | '0', boolean[][]> = {
  '4': [
    [false, false, false, true, false],
    [false, false, true, true, false],
    [false, true, false, true, false],
    [true, false, false, true, false],
    [true, true, true, true, true],
    [false, false, false, true, false],
    [false, false, false, true, false],
  ],
  '0': [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, true, false, false],
    [false, false, false, true, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
  ],
};

function Numeral({ digit }: { digit: '4' | '0' }) {
  const grid = GLYPHS[digit];
  const pigment = PIGMENT[digit];
  let index = 0;
  return (
    <svg
      viewBox="0 0 5 7"
      className="h-auto w-full"
      aria-hidden="true"
      focusable="false"
      style={{ maxWidth: '5.5rem' }}
    >
      {grid.map((row, y) =>
        row.map((on, x) => {
          const i = index++;
          if (!on) return null;
          return (
            <circle
              key={`${x}-${y}`}
              className="constellation-dot"
              style={{ ['--dot-index' as string]: i }}
              cx={x + 0.5}
              cy={y + 0.5}
              r={0.42}
              fill={pigment[y]?.[x] ? 'var(--color-pigment)' : 'var(--color-ink)'}
            />
          );
        }),
      )}
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70vh] items-center pt-[calc(var(--masthead-h)+3rem)] pb-24">
      <div className="grid12 w-full">
        <div className="col-span-12 lg:col-start-3 lg:col-span-7">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="mono text-[var(--step-micro)] tracking-[0.06em] text-[var(--color-pigment)]">
              404
            </span>
            <span className="micro">Not found</span>
          </div>

          <div className="mb-8 flex items-start gap-5">
            <Numeral digit="4" />
            <Numeral digit="0" />
            <Numeral digit="4" />
          </div>

          <h1
            className="font-[family-name:var(--font-serif)] tracking-[-0.025em]"
            style={{
              fontSize: 'clamp(2.5rem, 1.5rem + 3.6vw, 4.25rem)',
              lineHeight: 1,
              fontWeight: 350,
            }}
          >
            This page failed closed.
          </h1>

          <p className="prose-measure mt-7 text-[1.05em] leading-[1.6] text-[var(--color-graphite)]">
            There is nothing at this address, so rather than guess at what you
            meant and send you somewhere plausible, the site is telling you
            plainly. That is the same rule the three systems on it follow.
          </p>

          <Rule className="my-9" />

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn btn--pigment" data-magnetic data-cursor="view">
              Back to the start
            </Link>
            <Link href="/#work" className="btn" data-cursor="view">
              Selected work
            </Link>
            <AskButton className="btn btn--quiet" data-cursor="ask">
              Ask the guide
            </AskButton>
          </div>
        </div>
      </div>
    </div>
  );
}
