import Link from 'next/link';
import { Rule } from '@/components/Section';
import { AskButton } from '@/components/TrackedLinks';

/**
 * "This page failed closed."
 *
 * The joke is the whole site's argument: when a system does not know, it
 * refuses rather than guesses. A 404 is that rule applied to a URL.
 */
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
            <Link href="/" className="btn btn--pigment">
              Back to the start
            </Link>
            <Link href="/#work" className="btn">
              Selected work
            </Link>
            <AskButton className="btn btn--quiet">Ask the guide</AskButton>
          </div>
        </div>
      </div>
    </div>
  );
}
