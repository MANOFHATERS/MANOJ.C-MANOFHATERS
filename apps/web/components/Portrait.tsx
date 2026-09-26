'use client';

import { useState } from 'react';

/**
 * Fig. 0.
 *
 * Manoj's photograph has not been supplied yet (CONTENT-TODO.md, item 7).
 * Rather than ship a stock portrait or an AI-generated face — both of which
 * are on the ban list and both of which would be a lie — the plate holds a
 * typographic stand-in at the exact print proportion the photograph will
 * take, so dropping the real file into public/ changes nothing else.
 */
export function Portrait({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--color-rule)] bg-[var(--color-paper-raised)]">
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center">
          <span
            className="font-[family-name:var(--font-serif)] text-[var(--color-rule-strong)]"
            style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1 }}
            aria-hidden="true"
          >
            §
          </span>
          <p className="micro max-w-[22ch] leading-[1.6]">
            Photograph to be placed here. No stock image, no generated face.
          </p>
        </div>
      )}
    </div>
  );
}
