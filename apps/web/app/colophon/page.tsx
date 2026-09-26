import type { Metadata } from 'next';
import { colophon, site } from '@manoj/content/profile';
import { Rule } from '@/components/Section';
import { InkLink } from '@/components/Primitives';

export const metadata: Metadata = {
  title: 'Colophon',
  description:
    'How this site is built: typefaces, stack, hosting, and exactly what is stored about visitors and for how long.',
  alternates: { canonical: '/colophon' },
};

export default function Colophon() {
  return (
    <article className="shell pt-[calc(var(--masthead-h)+3rem)] pb-24 lg:pt-[calc(var(--masthead-h)+5rem)]">
      <div className="grid12">
        <div className="col-span-12 lg:col-start-3 lg:col-span-8">
          <div className="mb-6 flex items-baseline gap-4">
            <span className="mono text-[var(--step-micro)] tracking-[0.06em] text-[var(--color-pigment)]">
              §09
            </span>
            <span className="micro">Colophon</span>
          </div>

          <h1
            className="font-[family-name:var(--font-serif)] tracking-[-0.025em]"
            style={{
              fontSize: 'clamp(2.25rem, 1.5rem + 3vw, 3.75rem)',
              lineHeight: 1.02,
              fontWeight: 350,
            }}
          >
            How this was made
          </h1>

          <p className="lede mt-6 max-w-[42ch] font-[family-name:var(--font-sans)]">
            {colophon.note}
          </p>

          {/* Typefaces */}
          <section className="mt-16">
            <Rule />
            <h2 className="micro mt-5 mb-6">Typefaces</h2>
            <dl className="m-0">
              {colophon.typefaces.map((t) => (
                <div
                  key={t.name}
                  className="grid12 border-t border-[var(--color-rule)] py-6"
                >
                  <dt className="col-span-12 lg:col-span-4">
                    <InkLink
                      href={t.href}
                      external
                      className="font-[family-name:var(--font-serif)] text-[1.25rem]"
                    >
                      {t.name}
                    </InkLink>
                    <span className="caption mt-1 block">{t.by}</span>
                  </dt>
                  <dd className="col-span-12 m-0 mt-3 lg:col-start-6 lg:col-span-7 lg:mt-0">
                    <p className="prose-measure text-[0.97em] leading-[1.58]">{t.use}</p>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="caption mt-6 max-w-[54ch]">
              All three are open-licence, self-hosted and subset at build time, so
              the content security policy on this site can say{' '}
              <code className="mono text-[0.85em]">font-src &apos;self&apos;</code>{' '}
              and mean it.
            </p>
          </section>

          {/* Stack */}
          <section className="mt-16">
            <Rule />
            <h2 className="micro mt-5 mb-6">Stack</h2>
            <dl className="m-0">
              {colophon.stack.map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-col gap-1 border-t border-[var(--color-rule)] py-4 sm:flex-row sm:gap-8"
                >
                  <dt className="micro w-[8rem] flex-none pt-1">{k}</dt>
                  <dd className="m-0 text-[0.97em] leading-[1.55]">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Motion — the token reference, published as live documentation
              (Motion PRD 6.6: a site that documents its own system earns
              jury credibility). */}
          <section id="motion" className="mt-16 scroll-mt-32">
            <Rule />
            <h2 className="micro mt-5 mb-6">Motion — “Measured Precision”</h2>
            <p className="prose-measure text-[0.97em] leading-[1.6]">
              The site moves like a precision instrument rather than a slot
              machine. Every duration, curve and stagger is a named token —
              the same values printed below are the ones shipped in the
              stylesheet — and every animation either explains structure or
              confirms an action. Sound is off by default; vibration exists
              only where the browser honestly supports it. If you have asked
              your system for reduced motion, everything below stands still
              and the site still works, which is the point.
            </p>

            <div className="mt-8 overflow-x-auto">
              <table className="metric-table">
                <thead>
                  <tr>
                    <th scope="col" className="w-[38%]">Token</th>
                    <th scope="col" className="w-[28%]">Value</th>
                    <th scope="col" className="w-[34%]">Register / use</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['--dur-instant', '90 ms', 'Productive — toggles, pressed states'],
                    ['--dur-quick', '140 ms', 'Productive — hover colour, focus rings'],
                    ['--dur-base', '220 ms', 'Productive — button fills, arrow swaps'],
                    ['--dur-moderate', '320 ms', 'Expressive — card lifts, menu reveals'],
                    ['--dur-slow', '480 ms', 'Expressive — section entrances'],
                    ['--dur-scenic', '800 ms', 'Expressive — hero rises, counters'],
                    ['--dur-cinematic', '1200 ms', 'Expressive — specimen morphs'],
                    ['--ease-standard', 'cubic-bezier(0.2, 0, 0.38, 0.9)', 'State changes'],
                    ['--ease-entrance', 'cubic-bezier(0, 0, 0.3, 1)', 'Content arriving'],
                    ['--ease-exit', 'cubic-bezier(0.4, 0, 1, 1)', 'Faster out than in'],
                    ['--ease-settle', 'cubic-bezier(0.2, 0, 0, 1)', 'Sections settling'],
                    ['--ease-draw', 'cubic-bezier(0.65, 0, 0.35, 1)', 'Lines drawing'],
                    ['--ease-expo', 'cubic-bezier(0.16, 1, 0.3, 1)', 'Long deceleration'],
                    ['--stagger-item', '40 ms', 'Lists of six or fewer'],
                    ['--stagger-line', '90 ms', 'Typographic line reveals'],
                    ['--parallax-cap', '96 px', 'Hard travel ceiling, any element'],
                  ].map(([token, value, use]) => (
                    <tr key={token}>
                      <td className="mono text-[0.85em]">{token}</td>
                      <td>
                        <span className="val">{value}</span>
                      </td>
                      <td>
                        <span className="src">{use}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="caption mt-6 max-w-[54ch]">
              Any change to a token value requires a decision record; any
              discrepancy between this table and the shipped stylesheet is
              treated as a defect of the highest severity.
            </p>
          </section>

          {/* Decisions worth stating */}
          <section className="mt-16">
            <Rule />
            <h2 className="micro mt-5 mb-6">Decisions</h2>
            <ul className="m-0 list-none p-0">
              {[
                'Light only. There is no dark mode and no theme toggle — not because it was forgotten, but because the whole art direction is warm paper and black ink, and a dark inversion of it would be a different and worse site.',
                'One accent colour, International Klein Blue — Yves Klein’s registered formula of 1960 — used only where it means something: the section marks, links, the highlighted path in the specimen, the left tail of the distribution. At 10.15:1 on this paper it is link-safe and AAA at every size.',
                'One 3D object, loaded after the text has painted, paused whenever it is off-screen or the tab is hidden, and replaced by a vector still for anyone who has asked for reduced motion or has no WebGL.',
                'One motion engine. GSAP (free since 2025) drives scroll choreography, Lenis wraps — never replaces — the native scroll for feel, and entrances remain native CSS scroll-driven animation inside a @supports block, so a browser without it shows finished content rather than content stuck at zero opacity. Every duration and curve is a named token, published in the table above.',
                'Sound is a quiet instrument: five voices synthesized in the browser (zero audio files, the CSP untouched), off by default, one click to enable, and the toggle remembers you. No sound or vibration ever plays without a preceding action in the same session.',
                'No cookies, no third-party scripts, no analytics that can identify you.',
              ].map((d, i) => (
                <li key={i} className="flex gap-4 border-t border-[var(--color-rule)] py-5">
                  <span className="mono flex-none pt-0.5 text-[var(--step-micro)] text-[var(--color-pigment)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="prose-measure text-[0.97em] leading-[1.6]">{d}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Privacy */}
          <section id="privacy" className="mt-16 scroll-mt-32">
            <Rule />
            <h2 className="micro mt-5 mb-6">Privacy</h2>
            <ul className="m-0 list-none p-0">
              {colophon.privacy.map((p, i) => (
                <li key={i} className="border-t border-[var(--color-rule)] py-5">
                  <p className="prose-measure text-[0.97em] leading-[1.6]">{p}</p>
                </li>
              ))}
            </ul>
            <p className="caption mt-6 max-w-[54ch]">
              This follows the data-minimisation spirit of India&rsquo;s Digital
              Personal Data Protection Act, 2023: the site collects the least it
              can and deletes it on a schedule rather than on request.
            </p>
          </section>

          <Rule tone="ink" className="mt-16" />
          <p className="micro mt-5">
            {site.name} · Bengaluru · Updated {site.updated}
          </p>
        </div>
      </div>
    </article>
  );
}
