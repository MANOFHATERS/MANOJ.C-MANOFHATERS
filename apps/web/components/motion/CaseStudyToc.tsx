'use client';

import { useEffect, useRef } from 'react';

/**
 * The case-study TOC rail (Motion PRD 10.6) — the seven sections listed
 * in the left margin on wide screens, the current one inked. Plain
 * anchor links that glide under Lenis, because a two-thousand-word
 * study deserves the navigation dignity a printed monograph gives its
 * chapters. Hidden entirely from print and from narrow screens.
 */

export function CaseStudyToc({
  items,
}: {
  items: ReadonlyArray<{ id: string; label: string }>;
}) {
  const rail = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.toc-rail a'),
    );
    if (links.length === 0) return;

    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute('id');
          links.forEach((l) => {
            const hash = l.getAttribute('href')?.slice(1);
            if (hash) {
              l.setAttribute(
                'aria-current',
                hash === id ? 'true' : 'false',
              );
            }
          });
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      ref={rail}
      aria-label="Sections"
      className="toc-rail no-print hidden xl:block"
    >
      <ul>
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>
              <span className="mono mr-2 opacity-70">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
