'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { STATE_CAPTION, type SpecimenStateName } from '@/lib/specimen-geometry';
import { SpecimenStill } from './SpecimenStill';

/**
 * The specimen is loaded after the hero text has painted and the browser is
 * idle, so the 3D never delays the first read. Until then — and forever, on
 * any device that should not be running WebGL — the still stands in its place
 * at exactly the same size, so nothing shifts when the live scene arrives.
 */
const SpecimenCanvas = dynamic(() => import('./SpecimenCanvas'), {
  ssr: false,
  loading: () => null,
});

type Mode = 'deciding' | 'still' | 'live';

function decideMode(): Exclude<Mode, 'deciding'> {
  if (typeof window === 'undefined') return 'still';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still';

  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  if (conn?.saveData) return 'still';

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === 'number' && mem < 2) return 'still';

  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
    if (!gl) return 'still';
  } catch {
    return 'still';
  }

  return 'live';
}

function useDeferredMode(): Mode {
  const [mode, setMode] = useState<Mode>('deciding');

  useEffect(() => {
    const decided = decideMode();
    if (decided === 'still') {
      setMode('still');
      return;
    }

    let cancelled = false;
    const start = () => {
      if (!cancelled) setMode('live');
    };

    // After paint, then when the browser has nothing better to do.
    const raf = requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) {
        (window as Window & typeof globalThis).requestIdleCallback(start, {
          timeout: 1800,
        });
      } else {
        setTimeout(start, 400);
      }
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return mode;
}

/** Pauses the canvas when it leaves the viewport or the tab is hidden. */
function useVisible(ref: React.RefObject<HTMLElement | null>): boolean {
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { rootMargin: '120px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  return onScreen && tabVisible;
}

/* ── Inline: one state, sized by its container ─────────────────────────── */

export function SpecimenInline({
  state,
  className = '',
  ssrStill = true,
}: {
  state: SpecimenStateName;
  className?: string;
  /**
   * Whether to render the vector still during server rendering.
   *
   * True for the hero and the case-study headers, where the still is the
   * content a visitor without JavaScript sees. False for the repeated plates
   * in the work index, where four server-rendered specimens tripled the
   * weight of the home page's HTML to say the same thing four times.
   */
  ssrStill?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const mode = useDeferredMode();
  const visible = useVisible(wrap);
  const [label, setLabel] = useState<string | null>(null);

  // The caller positions this wrapper (every one of them uses
  // `absolute inset-0` inside a container with a fixed aspect ratio). Adding
  // `relative` here as well silently won the cascade in Tailwind v4, which
  // took the wrapper out of its absolute placement, left it zero-high, and
  // rendered the specimen as a speck.
  const wrapperClass = className || 'relative';

  if (!ssrStill && mode === 'deciding') {
    return <div ref={wrap} className={wrapperClass} />;
  }

  return (
    <div ref={wrap} className={wrapperClass}>
      {mode === 'live' ? (
        <SpecimenCanvas state={state} active={visible} onHoverLabel={setLabel} />
      ) : (
        <SpecimenStill state={state} className="absolute inset-0" />
      )}
    </div>
  );
}

/* ── Rail: one canvas, three states, driven by scroll ──────────────────── */

export function SpecimenRail() {
  const wrap = useRef<HTMLDivElement>(null);
  const mode = useDeferredMode();
  const [state, setState] = useState<SpecimenStateName>('graph');
  const [active, setActive] = useState(true);
  const [label, setLabel] = useState<string | null>(null);
  const tabVisible = useRef(true);

  /* Zones are declared in the page with data-specimen. The one nearest the
     middle of the viewport wins, which means the state changes as you read
     rather than snapping at an arbitrary threshold — and nothing about the
     scroll itself is intercepted. */
  useEffect(() => {
    const zones = Array.from(
      document.querySelectorAll<HTMLElement>('[data-specimen]'),
    );
    if (zones.length === 0) return;

    let frame = 0;
    function evaluate() {
      frame = 0;
      const mid = window.innerHeight / 2;
      let best: { el: HTMLElement; d: number } | null = null;
      let anyOnScreen = false;

      for (const el of zones) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        anyOnScreen = true;
        const centre = r.top + r.height / 2;
        const d = Math.abs(centre - mid);
        if (!best || d < best.d) best = { el, d };
      }

      setActive(anyOnScreen && tabVisible.current);
      if (best) {
        const next = best.el.dataset.specimen as SpecimenStateName;
        setState((prev) => (prev === next ? prev : next));
      }
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    }

    function onVis() {
      tabVisible.current = !document.hidden;
      evaluate();
    }

    evaluate();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed inset-y-0 right-0 z-10 hidden w-[42vw] max-w-[44rem] lg:block"
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 520ms var(--ease-settle)',
      }}
    >
      <div className="relative h-full" style={{ pointerEvents: active ? 'auto' : 'none' }}>
        {mode === 'live' ? (
          <SpecimenCanvas state={state} active={active} onHoverLabel={setLabel} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <SpecimenStill state={state} className="max-h-[70vh]" />
          </div>
        )}
      </div>

      {/* The label hangs in the margin, set in the serif, the way a plate is
          annotated in a printed monograph. */}
      <div className="pointer-events-none absolute bottom-[12vh] left-8 right-12">
        <NodeLabel label={label} />
        <p className="caption mt-3 max-w-[34ch] opacity-70">
          <span className="fig-id mono mr-2 text-[var(--color-pigment)]">
            {state === 'graph' ? 'Fig. 1.3' : state === 'tail' ? 'Fig. 2.3' : 'Fig. 3.3'}
          </span>
          {state === 'graph'
            ? 'Illustrative repurposing path, in pigment. Not a model prediction.'
            : state === 'tail'
              ? 'The dashed curve is the Gaussian the market is usually assumed to follow.'
              : 'Four layers, four providers, one place.'}
        </p>
      </div>

      <span className="sr-only">{STATE_CAPTION[state]}</span>
    </div>
  );
}

function NodeLabel({ label }: { label: string | null }) {
  return (
    <p
      className="pointer-events-none font-[family-name:var(--font-serif)] text-[1.05rem] leading-snug text-[var(--color-ink)]"
      style={{
        opacity: label ? 1 : 0,
        transform: label ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 240ms var(--ease-settle), transform 240ms var(--ease-settle)',
      }}
      aria-hidden="true"
    >
      {label ?? ' '}
    </p>
  );
}
