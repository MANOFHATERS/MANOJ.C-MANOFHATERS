'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { identity, navigation, socialLinks } from '@manoj/content/profile';
import { useAsk } from '@/components/ask/AskProvider';
import { track } from '@/lib/events';
import { AvailabilityLine } from '@/components/Availability';
import { ArrowNE } from '@/components/Icons';
import { SoundToggle } from '@/components/motion/SoundToggle';

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

/** The overlay links: the site's sections, plus the two cross-cutting pages.
 *  The § numbers are the page's own section numbers, not list indices. */
const MENU_LINKS = [
  { label: 'Work', href: '/#work', mark: '§03' },
  { label: 'How I work', href: '/#how-i-work', mark: '§04' },
  { label: 'About', href: '/#about', mark: '§06' },
  { label: 'Ask Manoj', href: '/#ask', mark: '§07', ask: true },
  { label: 'Contact', href: '/#contact', mark: '§08' },
  { label: 'Résumé', href: '/resume', mark: 'PDF' },
];

/**
 * 64px tall. Sticks on scroll-up only, so scrolling down gives the page back
 * its full height and scrolling up always has navigation within reach.
 *
 * "Menu" opens the full-screen overlay — the Snellenberg structure: big
 * links, a socials column, location, local time and availability, all
 * inside the overlay. Links roll their labels on hover.
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

  /* The overlay locks the page beneath it — including the smooth-scroll
     layer, which must be stopped for the lock to hold (Lenis contract). */
  useEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.insetInline = '0';
    void import('@/lib/motion/lenis').then(({ getLenis }) => {
      getLenis()?.stop();
    });
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.insetInline = '';
      window.scrollTo(0, scrollY);
      void import('@/lib/motion/lenis').then(({ getLenis }) => {
        getLenis()?.start();
      });
    };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  return (
    <>
      <header
        className="no-print fixed inset-x-0 top-0 z-50 transition-transform duration-300 will-change-transform"
        style={{
          transform: hidden && !menuOpen ? 'translateY(-100%)' : 'translateY(0)',
          backgroundColor: menuOpen
            ? 'transparent'
            : atTop
              ? 'transparent'
              : 'color-mix(in srgb, var(--bg) 88%, transparent)',
          backdropFilter: atTop && !menuOpen ? 'none' : 'blur(8px)',
          borderBottom:
            atTop || menuOpen
              ? '1px solid transparent'
              : '1px solid var(--border-subtle)',
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
              onClick={menuOpen ? closeMenu : undefined}
              className="inline-flex items-center py-1.5 font-[family-name:var(--font-serif)] text-[1.35rem] leading-none tracking-[-0.02em]"
            >
              Manoj C
            </Link>
            <span
              className="mono hidden text-[var(--step-micro)] text-[var(--action)] sm:inline tabular"
              aria-hidden="true"
            >
              {active && !menuOpen ? `§${active}` : ''}
            </span>
            <span className="sr-only" aria-live="polite">
              {active && SECTION_LABELS[active]
                ? `Section ${active}, ${SECTION_LABELS[active]}`
                : ''}
            </span>
          </div>

          {/* Desktop — inline nav, no overlay needed */}
          <div className="hidden items-center gap-7 md:flex">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="ui text-[var(--step-small)] ink-link">
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => openAsk()}
              className="ui text-[var(--step-small)] ink-link"
              data-cursor="ask"
            >
              Ask
            </button>
            <a
              href={identity.emailHref}
              onClick={() => track('email_click')}
              className="ui text-[var(--step-small)] text-[var(--action)] ink-link"
              data-cursor="write"
            >
              Email
            </a>
            {/* The sound toggle — default off, one click, reversible
                (Motion PRD 11.1). The glyph is drawn in the 1.5px grammar. */}
            <SoundToggle />
          </div>

          {/* Phone — the overlay lives here */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              type="button"
              onClick={() => openAsk()}
              className="ui text-[var(--step-small)] ink-link"
            >
              Ask
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="ui text-[var(--step-small)] ink-link"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>

          {/* Desktop — Menu opens the same overlay */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="ui hidden text-[var(--step-small)] ink-link md:inline-flex"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </nav>
      </header>

      {/* ── The full-screen menu ─────────────────────────────────────── */}
      <div
        id="site-menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        data-lenis-prevent
        className="no-print fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[var(--bg)]"
        style={{
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? 'visible' : 'hidden',
          transition:
            'opacity var(--dur-moderate) var(--ease-settle), visibility 0s linear ' +
            (menuOpen ? '0s' : 'var(--dur-moderate)'),
        }}
      >
        <div
          className="shell flex w-full flex-1 flex-col justify-end pb-10 pt-[calc(var(--masthead-h)+4vh)]"
          onClick={closeMenu}
        >
          <ul className="m-0 list-none p-0">
            {MENU_LINKS.map((item, i) => (
              <li
                key={item.label}
                className="border-t border-[var(--border-subtle)] last:border-b"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? 'translateY(0)' : 'translateY(14px)',
                  /* Tightened to the moderate duration with the 40ms item
                     stagger (Motion PRD 6.4 / 15.4). */
                  transition: `opacity var(--dur-moderate) var(--ease-settle) ${60 + i * 40}ms, transform var(--dur-moderate) var(--ease-settle) ${60 + i * 40}ms`,
                }}
              >
                {item.ask ? (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu();
                      openAsk();
                    }}
                    className="group flex w-full items-baseline justify-between py-4 text-left font-[family-name:var(--font-serif)] tracking-[-0.02em]"
                    >
                      <span className="roll" style={{ fontSize: 'var(--step-h2)', lineHeight: 1.1 }}>
                        <span>
                          <span>{item.label}</span>
                          <span aria-hidden="true">{item.label}</span>
                        </span>
                      </span>
                      <span className="mono text-[var(--step-micro)] text-[var(--text-muted)]">
                        §07
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="group flex items-baseline justify-between py-4 font-[family-name:var(--font-serif)] tracking-[-0.02em]"
                    >
                      <span className="roll" style={{ fontSize: 'var(--step-h2)', lineHeight: 1.1 }}>
                        <span>
                          <span>{item.label}</span>
                          <span aria-hidden="true">{item.label}</span>
                        </span>
                      </span>
                      <span className="mono text-[var(--step-micro)] text-[var(--text-muted)]">
                        {item.mark}
                      </span>
                    </Link>
                  )}
              </li>
            ))}
          </ul>

          {/* The meta band: socials, location, availability */}
          <div
            className="mt-10 flex flex-col gap-6"
            style={{
              opacity: menuOpen ? 1 : 0,
              transition: 'opacity var(--dur-moderate) var(--ease-settle) 320ms',
            }}
          >
            <ul className="m-0 flex flex-wrap gap-x-6 gap-y-2 list-none p-0">
              <li>
                <SoundToggle className="!text-[var(--step-small)]" />
              </li>
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="ui inline-flex items-center gap-1.5 text-[var(--step-small)] ink-link"
                  >
                    {s.label}
                    <ArrowNE size={11} />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={identity.emailHref}
                  onClick={() => {
                    track('email_click');
                    closeMenu();
                  }}
                  className="ui text-[var(--step-small)] ink-link"
                >
                  Email
                </a>
              </li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <AvailabilityLine />
              <p className="micro">© {new Date().getFullYear()} {identity.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
