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

          {/* Decisions worth stating */}
          <section className="mt-16">
            <Rule />
            <h2 className="micro mt-5 mb-6">Decisions</h2>
            <ul className="m-0 list-none p-0">
              {[
                'Light only. There is no dark mode and no theme toggle — not because it was forgotten, but because the whole art direction is warm paper and black ink, and a dark inversion of it would be a different and worse site.',
                'One accent colour, International Klein Blue — Yves Klein’s registered formula of 1960 — used only where it means something: the section marks, links, the highlighted path in the specimen, the left tail of the distribution. At 10.15:1 on this paper it is link-safe and AAA at every size.',
                'One 3D object, loaded after the text has painted, paused whenever it is off-screen or the tab is hidden, and replaced by a vector still for anyone who has asked for reduced motion or has no WebGL.',
                'No animation library. Scroll-linked motion is native CSS inside a @supports block, so a browser without it shows finished content rather than content stuck at zero opacity.',
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
