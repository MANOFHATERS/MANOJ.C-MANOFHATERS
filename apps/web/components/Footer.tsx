import Link from 'next/link';
import { identity, site } from '@manoj/content/profile';
import { InkLink } from '@/components/Primitives';
import { AvailabilityLine } from '@/components/Availability';
import { EmailLink, ResumeLink } from '@/components/TrackedLinks';
import { ArrowNE } from '@/components/Icons';
import { FooterApproach } from '@/components/motion/FooterApproach';

/**
 * The ink band (PRD Ch. 11.1): the single loudest moment on the page.
 * An inverted well of ink at the end of the paper — "Let's talk" at mega
 * scale, the email address as the giant hoverable link, availability with
 * local time, socials as text. Everything else on the site is quieter than
 * this on purpose.
 */
export function Footer() {
  return (
    <footer className="bg-[var(--band-bg)] text-[var(--band-fg)]">
      {/* The mega CTA band — approaches with physical weight (PRD 10.5) */}
      <FooterApproach>
      <div className="shell pb-14 pt-20 lg:pt-28">
        <div className="grid12 gap-y-10">
          <div className="col-span-12 lg:col-span-9">
            <p className="mono mb-6 text-[var(--step-micro)] uppercase tracking-[0.08em] text-[var(--band-muted)]">
              §08 — Contact
            </p>
            <h2
              className="font-[family-name:var(--font-serif)] tracking-[-0.02em]"
              style={{
                fontSize: 'clamp(3rem, 1rem + 8.2vw, 9rem)',
                lineHeight: 0.98,
                fontWeight: 350,
                maxWidth: '12ch',
              }}
            >
              Let&apos;s talk.
            </h2>

            <EmailLink
              className="ink-link mt-9 inline-block break-all font-[family-name:var(--font-serif)] tracking-[-0.02em] text-[var(--band-fg)]"
              style={{
                fontSize: 'clamp(1.45rem, 0.9rem + 2.6vw, 3rem)',
                lineHeight: 1.12,
                fontWeight: 350,
              }}
            >
              {identity.email}
            </EmailLink>

            <p className="mt-10 max-w-[52ch] text-[0.98em] leading-[1.6] text-[var(--band-secondary)]">
              I read everything that arrives here. Open to engineering
              internships now and full-time work from graduation — ML systems
              or full-stack, in Bengaluru or remote.
            </p>

            <div className="mt-8">
              <div className="text-[var(--band-secondary)]">
                <AvailabilityLine tone="paper" />
              </div>
            </div>
          </div>

          {/* Index column */}
          <nav aria-label="Footer" className="col-span-12 lg:col-start-11 lg:col-span-2">
            <p className="mono mb-4 text-[var(--step-micro)] uppercase tracking-[0.08em] text-[var(--band-muted)]">
              Index
            </p>
            <ul className="m-0 list-none space-y-2.5 p-0">
              {[
                { label: 'DrugOS', href: '/work/drugos' },
                { label: 'TailGen', href: '/work/tailgen' },
                { label: 'AtmosView', href: '/work/atmosview' },
                { label: 'Résumé', href: '/resume' },
                { label: 'Colophon', href: '/colophon' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="ui text-[var(--step-small)] text-[var(--band-secondary)] transition-colors duration-150 hover:text-[var(--band-fg)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      </FooterApproach>

      {/* The base line: socials as text, provenance, time */}
      <div className="shell border-t border-[var(--band-hairline)] pb-8 pt-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-baseline sm:justify-between">
          <ul className="m-0 flex flex-wrap gap-x-6 gap-y-2 list-none p-0">
            {[
              { label: 'GitHub', href: identity.github },
              { label: 'LinkedIn', href: identity.linkedin },
            ].map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui inline-flex items-center gap-1.5 text-[var(--step-small)] text-[var(--band-secondary)] transition-colors duration-150 hover:text-[var(--band-fg)]"
                >
                  {s.label}
                  <ArrowNE size={11} />
                </a>
              </li>
            ))}
            <li>
              <ResumeLink className="ui text-[var(--step-small)] text-[var(--band-secondary)] transition-colors duration-150 hover:text-[var(--band-fg)]">
                Résumé PDF
              </ResumeLink>
            </li>
          </ul>

          <p className="mono text-[var(--step-micro)] text-[var(--band-muted)]">
            Set in Newsreader, Switzer &amp; JetBrains Mono · Light only ·
            Hosted for ₹0
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="mono text-[var(--step-micro)] text-[var(--band-muted)]">
            © {new Date().getFullYear()} {identity.name} · Bengaluru
          </p>
          <p className="mono text-[var(--step-micro)] text-[var(--band-muted)]">
            Updated {site.updated} ·{' '}
            <InkLink
              href={site.url.replace('https://', 'https://')}
              className="text-[var(--band-muted)]"
            >
              {site.url.replace('https://', '')}
            </InkLink>
          </p>
        </div>
      </div>
    </footer>
  );
}
