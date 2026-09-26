import { contact, identity } from '@manoj/content/profile';
import { SectionMark, Rule } from '@/components/Section';
import { CopyButton } from '@/components/CopyButton';
import { InkLink } from '@/components/Primitives';
import { EmailLink, PhoneLink, ResumeLink } from '@/components/TrackedLinks';

/** §08. Every link here opens a real destination on the first click. */
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

        <div className="grid12">
          <div className="col-span-12 lg:col-start-3 lg:col-span-8">
            <p className="caption mb-4">{contact.lede}</p>

            <EmailLink className="ink-link block font-[family-name:var(--font-serif)] tracking-[-0.025em] break-words">
              <span
                style={{
                  fontSize: 'clamp(1.6rem, 1rem + 3.2vw, 3.4rem)',
                  lineHeight: 1.05,
                  fontWeight: 350,
                }}
              >
                {identity.email}
              </span>
            </EmailLink>

            <div className="mt-6 flex flex-wrap gap-3">
              <EmailLink className="btn btn--pigment">Email Manoj</EmailLink>
              <CopyButton value={identity.email} label="Copy address" event="email_copy" />
              <ResumeLink className="btn">Download résumé</ResumeLink>
            </div>

            <p className="prose-measure mt-12 text-[1.05em] leading-[1.55]">
              {contact.openTo}
            </p>

            <dl className="mt-12 grid grid-cols-1 gap-x-8 sm:grid-cols-3">
              <div className="border-t border-[var(--color-rule)] py-5">
                <dt className="micro mb-2">Phone</dt>
                <dd className="m-0">
                  <PhoneLink className="mono ink-link text-[0.98rem]">
                    {identity.phone}
                  </PhoneLink>
                  <span className="mt-2 block">
                    <CopyButton
                      value="+918310907674"
                      label="Copy"
                      event="phone_click"
                      className="!px-2 !py-1 !min-h-0"
                    />
                  </span>
                </dd>
              </div>

              <div className="border-t border-[var(--color-rule)] py-5">
                <dt className="micro mb-2">GitHub</dt>
                <dd className="m-0">
                  <InkLink
                    href={identity.github}
                    external
                    className="ui text-[var(--step-caption)]"
                  >
                    {identity.githubHandle}
                  </InkLink>
                </dd>
              </div>

              <div className="border-t border-[var(--color-rule)] py-5">
                <dt className="micro mb-2">LinkedIn</dt>
                <dd className="m-0">
                  <InkLink
                    href={identity.linkedin}
                    external
                    className="ui text-[var(--step-caption)] break-all"
                  >
                    {identity.linkedinHandle}
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
