'use client';

import { useState } from 'react';

/**
 * Fig. 0.
 *
 * Manoj's photograph has not been supplied yet (CONTENT-TODO.md, item 7).
 * Rather than ship a stock portrait or an AI-generated face — both of which
 * are on the ban list and both of which would be a lie — the plate holds a
 * deliberate editorial device at the exact print proportion the photograph
 * will take: a scientific-plate field of ink cross-hatch, registration
 * corners and the section mark, the way a print reserve is marked in a
 * photo-ready manuscript. Dropping the real file into public/ changes
 * nothing else.
 */
export function Portrait({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--border-strong)] bg-[var(--bg-raised)]">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={800}
          height={1000}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ filter: 'saturate(0.92) contrast(1.02)' }}
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          {/* The cross-hatch field — a print reserve, not a gray hole. */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, var(--hairline) 0 1px, transparent 1px 9px), repeating-linear-gradient(-45deg, var(--hairline) 0 1px, transparent 1px 9px)',
            }}
          />
          {/* Registration corners, like a crop mark on a proof. */}
          <svg
            className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] text-[var(--ink-faint)]"
            viewBox="0 0 100 125"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <path d="M0 6V0h6M94 0h6v6M100 119v6h-6M6 125H0v-6" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="relative z-10 max-w-[24ch] px-6 text-center">
            <span
              className="font-[family-name:var(--font-serif)] text-[var(--ink-3)]"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 6rem)', lineHeight: 1 }}
              aria-hidden="true"
            >
              M
            </span>
            <p className="micro mt-4 leading-[1.7]">
              Plate reserved — photograph pending
            </p>
            <p className="caption mt-2 leading-[1.55]">
              No stock image, no generated face. The portrait will occupy this
              exact proportion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
