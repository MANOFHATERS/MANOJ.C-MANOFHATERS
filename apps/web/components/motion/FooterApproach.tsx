'use client';

import { useEffect, useRef } from 'react';

import { prefersReducedMotion } from '@/lib/motion/lenis';

/**
 * The footer approach (Motion PRD 10.5) — the Let's-talk band approaches
 * at the 0.96 depth rate, so the loudest moment on the page also has the
 * most physical weight. One ScrollTrigger scrub, capped well inside the
 * 96px parallax ceiling; desktop only, gone entirely under reduced
 * motion, where depth becomes stillness.
 */
export function FooterApproach({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(min-width: 64rem)').matches) return;

    const el = host.current;
    if (!el) return;

    let ctx: { revert: () => void } | null = null;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap.fromTo(
            el,
            { y: 40 },
            {
              y: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                end: 'top 70%',
                scrub: true,
              },
            },
          );
        });
      },
    );

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={host} className="will-change-transform">
      {children}
    </div>
  );
}
