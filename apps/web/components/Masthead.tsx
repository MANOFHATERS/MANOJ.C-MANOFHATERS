'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { identity, navigation } from '@manoj/content/profile';
import { useAsk } from '@/components/ask/AskProvider';
import { track } from '@/lib/events';

const SECTION_LABELS: Record<string, string> = {
  '01': 'Hero',
  '02': 'Recognition',
  '03': 'Selected work',
  '04': 'How I work',
  '05': 'Capabilities',
  '06': 'About',
  '07': 'Ask Manoj',
  '08': 'Contact',
};

/**
 * 64px tall. Sticks on scroll-up only, so scrolling down gives the page back
 * its full height and scrolling up always has navigation within reach.
 */
export function Masthead() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const lastY = useRef(0);
  const { openAsk } = useAsk();

  /* Sticky-on-scroll-up. */
  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setAtTop(y < 8);
        const goingDown = y > lastY.current;
        // Ignore rubber-banding and tiny jitters.
        if (Math.abs(y - lastY.current) > 6) {
          setHidden(goingDown && y > 160);
          lastY.current = y;
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* The active section's § number, which doubles as a quiet progress
     indicator. Marks in the page body ignite at the same moment. */
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section]'),
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const mark = entry.target.getAttribute('data-section');
          if (!mark) continue;
          if (entry.isIntersecting) {
            setActive(mark);
            document
              .querySelectorAll<HTMLElement>(`.section-mark[data-mark="${mark}"]`)
              .forEach((el) => el.setAttribute('data-active', 'true'));
          } else {
            document
              .querySelectorAll<HTMLElement>(`.section-mark[data-mark="${mark}"]`)
              .forEach((el) => el.removeAttribute('data-active'));
          }
        }
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header
      className="no-print fixed inset-x-0 top-0 z-50 transition-transform duration-300 will-change-transform"
      style={{
        transform: hidden && !menuOpen ? 'translateY(-100%)' : 'translateY(0)',
        backgroundColor: atTop ? 'transparent' : 'color-mix(in srgb, var(--color-paper) 88%, transparent)',
        backdropFilter: atTop ? 'none' : 'blur(8px)',
        borderBottom: atTop ? '1px solid transparent' : '1px solid var(--color-rule)',
      }}
    >
      <nav
        aria-label="Primary"
        className="shell flex items-center justify-between"
        style={{ height: 'var(--masthead-h)' }}
      >
        <div className="flex items-baseline gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-serif)] text-[1.35rem] leading-none tracking-[-0.02em]"
          >
            Manoj C
          </Link>
          <span
            className="mono hidden text-[var(--step-micro)] text-[var(--color-pigment)] sm:inline tabular"
            aria-hidden="true"
          >
            {active ? `§${active}` : ''}
          </span>
          <span className="sr-only" aria-live="polite">
            {active && SECTION_LABELS[active]
              ? `Section ${active}, ${SECTION_LABELS[active]}`
              : ''}
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="ui text-[var(--step-caption)] ink-link">
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => openAsk()}
            className="ui text-[var(--step-caption)] ink-link"
          >
            Ask
          </button>
          <a
            href={identity.emailHref}
            onClick={() => track('email_click')}
            className="ui text-[var(--step-caption)] text-[var(--color-pigment)] ink-link"
          >
            Email
          </a>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            type="button"
            onClick={() => openAsk()}
            className="ui text-[var(--step-caption)] ink-link"
          >
            Ask
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="ui text-[var(--step-caption)] ink-link"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-[var(--color-rule)] bg-[var(--color-paper-raised)]"
        >
          <ul className="shell list-none m-0 py-4">
            {navigation.map((item) => (
              <li key={item.href} className="border-b border-[var(--color-rule)] last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3.5 font-[family-name:var(--font-serif)] text-[1.25rem]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              <a
                href={identity.emailHref}
                onClick={() => {
                  track('email_click');
                  setMenuOpen(false);
                }}
                className="btn btn--pigment w-full justify-center"
              >
                Email Manoj
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
