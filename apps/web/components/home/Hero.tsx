import { proofStrip, standfirst } from '@manoj/content/profile';
import { SectionMark } from '@/components/Section';
import { ResumeLink } from '@/components/TrackedLinks';
import { AvailabilityLine } from '@/components/Availability';
import { Counter } from '@/components/motion/Counter';
import { HeroPlate } from '@/components/home/HeroPlate';

/**
 * §01.
 *
 * The thesis is in the HTML from the first byte and is the LCP element. The
 * clip-mask reveal moves a wrapper, never the text's own opacity, so a
 * visitor on a slow connection reads the sentence before anything animates
 * and a visitor with JavaScript off reads it at full opacity forever.
 */

const THESIS_LINES = [
  'I build systems',
  'that tell the truth,',
  'especially when the truth',
  'is inconvenient.',
];

export function Hero() {
  return (
    <section
      id="top"
      data-section="01"
      aria-labelledby="hero-heading"
      className="section pt-[calc(var(--masthead-h)+3.5rem)] lg:pt-[calc(var(--masthead-h)+6rem)]"
    >
      <div className="shell">
        <div className="grid12">
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <SectionMark mark="01" />
              <span className="micro">Bengaluru, India</span>
            </div>

            <div className="mb-8">
              <AvailabilityLine />
            </div>

            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-serif)] tracking-[-0.025em]"
              style={{
                // Deliberately below the display step: the thesis has to hold
                // its own measure in eight columns, and a size that overflows
                // the column is a size that is too big, whatever the scale says.
                fontSize: 'clamp(2.6rem, 1.1rem + 5.4vw, 5.75rem)',
                lineHeight: 1.04,
                fontWeight: 350,
              }}
            >
              {THESIS_LINES.map((line, i) => (
                <span
                  key={line}
                  className="type-set-line"
                  style={{ ['--line-index' as string]: i }}
                >
                  <span>{line}</span>
                </span>
              ))}
            </h1>

            <p className="lede enter mt-10 max-w-[46ch] font-[family-name:var(--font-sans)]">
              {standfirst}
            </p>
            <div className="enter mt-10 flex flex-wrap items-center gap-3">
              <a href="#work" className="btn btn--pigment" data-magnetic data-cursor="view">
                Read the work
              </a>
              <ResumeLink className="btn" data-cursor="read">
                Download résumé
              </ResumeLink>
            </div>
          </div>

          {/* The field record — the hero's right-hand instrument. The
              text column spans eight; the plate files the ninth through
              the twelfth. Desktop composition only: the mobile hero is
              already complete, and a hidden plate adds zero shift. */}
          <div className="hidden lg:col-span-4 lg:block lg:mt-24">
            <HeroPlate />
          </div>
        </div>

        {/* The proof strip. Four facts, mono, hairline-separated. It pins
            for the first part of the hero's exit on desktop while the
            numbers count up once — then releases before it can become a
            hostage situation (Motion PRD 10.4). */}
        <div className="proof-strip-runway mt-16 lg:mt-24">
          <div className="proof-strip lg:max-w-[58%]">
            <hr className="rule rule--draw" aria-hidden="true" />
            <dl className="enter-stagger grid grid-cols-2 gap-x-6 sm:grid-cols-4">
              {proofStrip.map((fact, i) => (
                <div
                  key={fact.label}
                  className="border-b border-[var(--color-rule)] py-5 sm:border-b-0 sm:border-r sm:pr-5 sm:last:border-r-0"
                >
                  <dt className="micro mb-1.5">{fact.label}</dt>
                  <dd className="mono m-0 text-[1.35rem] leading-none tracking-[-0.01em] text-[var(--color-ink)]">
                    {/* Values count; sources never move (RFD-09). */}
                    <Counter value={fact.value} delay={200 + i * 90} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
