import Link from 'next/link';
import { identity, site } from '@manoj/content/profile';
import { InkLink } from '@/components/Primitives';
import { Rule } from '@/components/Section';
import { ResumeLink } from '@/components/TrackedLinks';

export function Footer() {
  return (
    <footer className="shell pb-16 pt-24">
      <Rule tone="ink" />
      <div className="grid12 mt-8 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <p className="font-[family-name:var(--font-serif)] text-[length:var(--step-h3)] leading-[1.25] tracking-[-0.015em] max-w-[18ch]">
            {site.thesis}
          </p>
        </div>

        <div className="col-span-6 lg:col-span-2 lg:col-start-7">
          <h2 className="micro mb-3">Pages</h2>
          <ul className="list-none p-0 m-0 space-y-2">
            <li>
              <Link href="/" className="ui text-[var(--step-caption)] ink-link">
                Home
              </Link>
            </li>
            <li>
              <Link href="/work/drugos" className="ui text-[var(--step-caption)] ink-link">
                DrugOS
              </Link>
            </li>
            <li>
              <Link href="/work/tailgen" className="ui text-[var(--step-caption)] ink-link">
                TailGen
              </Link>
            </li>
            <li>
              <Link href="/work/atmosview" className="ui text-[var(--step-caption)] ink-link">
                AtmosView
              </Link>
            </li>
            <li>
              <Link href="/resume" className="ui text-[var(--step-caption)] ink-link">
                Résumé
              </Link>
            </li>
            <li>
              <Link href="/colophon" className="ui text-[var(--step-caption)] ink-link">
                Colophon
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-6 lg:col-span-2">
          <h2 className="micro mb-3">Elsewhere</h2>
          <ul className="list-none p-0 m-0 space-y-2">
            <li>
              <InkLink href={identity.github} external className="ui text-[var(--step-caption)]">
                GitHub
              </InkLink>
            </li>
            <li>
              <InkLink href={identity.linkedin} external className="ui text-[var(--step-caption)]">
                LinkedIn
              </InkLink>
            </li>
            <li>
              <InkLink href={identity.emailHref} className="ui text-[var(--step-caption)]">
                Email
              </InkLink>
            </li>
            <li>
              <ResumeLink className="ui text-[var(--step-caption)] ink-link">
                Download PDF
              </ResumeLink>
            </li>
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-3">
          <h2 className="micro mb-3">Colophon</h2>
          <p className="caption max-w-[32ch]">
            Set in Newsreader, Schibsted Grotesk and IBM Plex Mono. Light only, by
            decision. Built and hosted for ₹0 a month.
          </p>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="micro">
          © {new Date().getFullYear()} {identity.name} · Bengaluru
        </p>
        <p className="micro">Updated {site.updated}</p>
      </div>
    </footer>
  );
}
