'use client';

import type { ReactNode } from 'react';
import { identity } from '@manoj/content/profile';
import { track } from '@/lib/events';
import { useAsk } from '@/components/ask/AskProvider';

const RESUME_PDF = '/Manoj-C-Resume.pdf';

export function ResumeLink({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={RESUME_PDF}
      download="Manoj-C-Resume.pdf"
      onClick={() => track('resume_download')}
      className={className}
    >
      {children}
    </a>
  );
}

export function EmailLink({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={identity.emailHref}
      onClick={() => track('email_click')}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}

export function PhoneLink({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={identity.phoneHref}
      onClick={() => track('phone_click')}
      className={className}
    >
      {children}
    </a>
  );
}

export function RepoLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('repo_click')}
      className={className}
    >
      {children}
    </a>
  );
}

export function AskButton({
  question,
  children,
  className = 'btn',
}: {
  question?: string;
  children: ReactNode;
  className?: string;
}) {
  const { openAsk } = useAsk();
  return (
    <button type="button" className={className} onClick={() => openAsk(question)}>
      {children}
    </button>
  );
}
