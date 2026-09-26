import { contact, identity } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';
import { CopyButton } from '@/components/CopyButton';
import { InkLink } from '@/components/Primitives';
import { EmailLink, PhoneLink, ResumeLink } from '@/components/TrackedLinks';
import { ArrowNE } from '@/components/Icons';

/**
 * §08. The quiet detail section: every route to Manoj, each one working on
 * the first click. The loud version of contact — the giant email, the
 * availability line, "Let's talk" — lives in the ink band of the footer,
 * which this section deliberately hands off to.
 */
export function Contact() {
  return (
    <section
      id="contact"
      data-section="08"
      aria-labelledby="contact-heading"
      className="section"
    >
      <div className="shell">
        <Rule />
        <div className="grid12 mt-6 mb-10">
          <div className="col-span-3 lg:col-span-2">
            <SectionMark mark="08" />
          </div>
          <div className="col-span-9 lg:col-span-5">
            <h2 id="contact-heading" className="micro">
              Contact
            </h2>
          </div>
        </div>

        <div className="grid12 gap-y-12">
          <div className="col-span-12 lg:col-start-3 lg:col-span-6">
            <p className="caption mb-6">{contact.lede}</p>
            <p className="prose-measure text-[1.05em] leading-[1.55]">
              {contact.openTo}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <EmailLink className="btn btn--pigment">Email Manoj</EmailLink>
              <CopyButton value={identity.email} label="Copy address" event="email_copy" />
              <ResumeLink className="btn">Download résumé</ResumeLink>
            </div>
          </div>

          <div className="col-span-12 lg:col-start-9 lg:col-span-4">
            <dl className="m-0 grid grid-cols-1 gap-x-8 sm:grid-cols-3 lg:grid-cols-1">
              <div className="border-t border-[var(--border-subtle)] py-5">
                <dt className="micro mb-2">Email</dt>
                <dd className="m-0">
                  <EmailLink className="ui break-all text-[var(--step-small)] ink-link">
                    {identity.email}
                  </EmailLink>
                </dd>
              </div>

              <div className="border-t border-[var(--border-subtle)] py-5">
                <dt className="micro mb-2">Phone</dt>
                <dd className="m-0">
                  <PhoneLink className="mono ink-link text-[0.95rem]">
                    {identity.phone}
                  </PhoneLink>
                </dd>
              </div>

              <div className="border-t border-[var(--border-subtle)] py-5">
                <dt className="micro mb-2">GitHub</dt>
                <dd className="m-0">
                  <InkLink
                    href={identity.github}
                    external
                    className="ui inline-flex items-center gap-1.5 text-[var(--step-small)]"
                  >
                    {identity.githubHandle}
                    <ArrowNE size={11} />
                  </InkLink>
                </dd>
              </div>

              <div className="border-t border-[var(--border-subtle)] py-5">
                <dt className="micro mb-2">LinkedIn</dt>
                <dd className="m-0">
                  <InkLink
                    href={identity.linkedin}
                    external
                    className="ui inline-flex items-center gap-1.5 text-[var(--step-small)] break-all"
                  >
                    {identity.linkedinHandle}
                    <ArrowNE size={11} />
                  </InkLink>
                </dd>
              </div>
            </dl>

            <p className="micro mt-8 normal-case tracking-[0.03em]">
              Based in {identity.location}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
