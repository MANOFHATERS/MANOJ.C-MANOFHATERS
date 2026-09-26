import type { Project } from '@manoj/content/projects';
import { ArrowNE } from '@/components/Icons';
import { RepoLink } from '@/components/TrackedLinks';

/**
 * The dossier plate on a case study's opening spread.
 *
 * Where the text column argues, the plate files: the case number, the one
 * number worth remembering, whether the system is deployed, and the two
 * doors out of the page — the live site and the repository. It borrows the
 * figure-plate grammar (hairline border, raised paper, micro labels) so it
 * reads as an instrument of the same document rather than a card that
 * wandered in from another site.
 */
export function CasePlate({ p }: { p: Project }) {
  const live = p.liveUrl;

  return (
    <aside
      aria-label={`${p.name} at a glance`}
      className="figure-enter border border-[var(--color-rule)] bg-[var(--color-paper-raised)] px-7 py-6 lg:mt-12"
    >
      {/* Case file header — the archive stamp. */}
      <div className="flex items-baseline justify-between gap-4">
        <span className="micro">Case file</span>
        <span className="mono text-[var(--step-micro)] tracking-[0.06em] text-[var(--color-graphite)]">
          {p.index}
          <span className="text-[var(--text-muted)]"> / 03</span>
        </span>
      </div>

      {/* The at-a-glance number. */}
      <div className="mt-6 border-t border-[var(--color-rule)] pt-6">
        <p className="micro mb-3">At a glance</p>
        <p className="mono m-0 text-[1.9rem] font-medium leading-none tracking-[-0.01em] text-[var(--color-ink)]">
          {p.headline.value}
        </p>
        <p className="caption mt-2.5 max-w-[26ch]">{p.headline.label}</p>
      </div>

      {/* Deployment status — the question every reader asks first. */}
      <div className="mt-6 border-t border-[var(--color-rule)] pt-6">
        <p className="micro mb-3.5">Status</p>
        <p className="m-0 flex items-center gap-2.5 text-[0.92rem] leading-snug text-[var(--color-ink)]">
          <span
            aria-hidden="true"
            className={`inline-block h-[7px] w-[7px] flex-none rounded-full ${
              live ? 'bg-[var(--color-signal-ok)]' : 'bg-[var(--color-graphite)]'
            }`}
          />
          {live ? 'Deployed — live and public' : 'Open source — research repository'}
        </p>

        {live ? (
          <div className="mt-5">
            <RepoLink
              href={live}
              className="btn btn--pigment w-full justify-between"
              data-magnetic
              data-cursor="view"
            >
              Open the live site
              <ArrowNE size={13} />
            </RepoLink>
            <p className="mono mt-3 mb-0 break-all text-[var(--step-micro)] tracking-[0.04em] text-[var(--text-muted)]">
              {p.liveLabel}
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <RepoLink
              href={p.repo}
              className="btn btn--pigment w-full justify-between"
              data-magnetic
              data-cursor="view"
            >
              View source on GitHub
              <ArrowNE size={13} />
            </RepoLink>
          </div>
        )}
      </div>

      {/* Source — where the claims can be checked. */}
      <div className="mt-6 border-t border-[var(--color-rule)] pt-5">
        <p className="micro mb-2.5">Source</p>
        <RepoLink href={p.repo} className="ink-link mono break-all text-[0.78rem]">
          {p.repoLabel}
        </RepoLink>
      </div>
    </aside>
  );
}
