'use client';

import { useEffect, useRef } from 'react';

/**
 * Diagram draws (Motion PRD 10.7) — the architecture diagrams literally
 * build the system in front of the reader: each SVG path draws its
 * stroke on entry, staggered 80ms on the draw curve.
 *
 * The technique is stroke-dashoffset with per-path measured lengths
 * (set once, then animated by the same CSDA view() timeline the rest
 * of the site uses — no JS per frame, and a browser without support
 * shows the finished diagram).
 */

export function DrawOnView({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const shapes = Array.from(
      el.querySelectorAll<SVGPathElement | SVGLineElement | SVGCircleElement>(
        'svg path, svg line, svg circle, svg rect, svg polyline',
      ),
    );

    shapes.forEach((shape, i) => {
      let length = 0;
      try {
        // getTotalLength exists on geometry elements; rects/circles in
        // this codebase are hairline boxes that also support it.
        length = (shape as SVGPathElement).getTotalLength();
      } catch {
        length = 0;
      }
      if (!length || !Number.isFinite(length)) return;

      const stagger = Math.min(i * 80, 640); // stagger law, capped
      shape.style.strokeDasharray = `${length}`;
      shape.style.strokeDashoffset = `${length}`;

      const animate = () => {
        shape.style.transition = `stroke-dashoffset var(--dur-scenic) var(--ease-draw) ${stagger}ms`;
        shape.style.strokeDashoffset = '0';
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(animate);
            io.disconnect();
          }
        },
        { rootMargin: '0px 0px -12% 0px' },
      );
      io.observe(shape);
      // Cleanup happens with the observer's disconnect on unmount via
      // the shape being removed; the site is statically rendered.
    });
  }, []);

  return (
    <div ref={host} className={className}>
      {children}
    </div>
  );
}
