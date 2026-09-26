import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { specimenDataUri } from './specimen-still-svg';
import type { SpecimenStateName } from './specimen-geometry';

/**
 * Open Graph images, in the same ink-on-paper as the site.
 *
 * Links to this site are mostly opened from LinkedIn and WhatsApp, so the
 * card is the first impression far more often than the hero is. It is drawn
 * with the real typefaces, read off disk rather than fetched, so the build
 * needs no network and the card cannot silently fall back to Arial.
 *
 * The faces here are static instances cut from the variable originals
 * (Newsreader at wght 350 / opsz 36, Switzer at wght 400, JetBrains Mono at 400). Satori cannot
 * read a variable font — it throws while parsing the fvar table — so the
 * instancing is a requirement, not an optimisation.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');

async function fonts() {
  const [serif, sans, mono] = await Promise.all([
    readFile(path.join(FONT_DIR, 'Newsreader-Static-Light.ttf')),
    readFile(path.join(FONT_DIR, 'Switzer-Regular.ttf')),
    readFile(path.join(FONT_DIR, 'JetBrainsMono-Regular.ttf')),
  ]);
  return [
    { name: 'Newsreader', data: serif, weight: 400 as const, style: 'normal' as const },
    { name: 'Switzer', data: sans, weight: 400 as const, style: 'normal' as const },
    { name: 'JBMono', data: mono, weight: 400 as const, style: 'normal' as const },
  ];
}

const PAPER = '#FAF9F6';
const INK = '#1A1917';
const GRAPHITE = '#403E39';
const PIGMENT = '#002FA7'; /* International Klein Blue */
const RULE = '#D6D3C8';

export async function renderOg({
  mark,
  kicker,
  title,
  standfirst,
  facts,
  specimen,
  titleSize = 76,
}: {
  mark: string;
  kicker: string;
  title: string;
  standfirst?: string;
  facts?: ReadonlyArray<readonly [string, string]>;
  specimen: SpecimenStateName;
  titleSize?: number;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: PAPER,
          fontFamily: 'Newsreader',
          position: 'relative',
        }}
      >
        {/* Left column: the words */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 0 56px 72px',
            width: 720,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'JBMono', fontSize: 20, color: PIGMENT }}>
              {mark}
            </span>
            <span
              style={{
                fontFamily: 'Switzer',
                fontSize: 17,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: GRAPHITE,
              }}
            >
              {kicker}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: titleSize,
                lineHeight: 1.04,
                color: INK,
                letterSpacing: -1.6,
                maxWidth: 640,
                display: 'flex',
              }}
            >
              {title}
            </div>
            {standfirst ? (
              <div
                style={{
                  fontFamily: 'Switzer',
                  fontSize: 22,
                  lineHeight: 1.45,
                  color: GRAPHITE,
                  marginTop: 24,
                  maxWidth: 580,
                  display: 'flex',
                }}
              >
                {standfirst}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 1, backgroundColor: RULE, width: 600 }} />
            <div style={{ display: 'flex', gap: 44, marginTop: 20 }}>
              {(facts ?? []).map(([v, l]) => (
                <div key={l} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: 'Switzer',
                      fontSize: 13,
                      letterSpacing: 1.6,
                      textTransform: 'uppercase',
                      color: GRAPHITE,
                    }}
                  >
                    {l}
                  </span>
                  <span
                    style={{
                      fontFamily: 'JBMono',
                      fontSize: 24,
                      color: INK,
                      marginTop: 6,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: the specimen */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 480,
            height: '100%',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={specimenDataUri(specimen)} width={420} height={420} alt="" />
        </div>

        {/* A hairline down the gutter, the way a plate is separated from the text */}
        <div
          style={{
            position: 'absolute',
            left: 720,
            top: 56,
            bottom: 56,
            width: 1,
            backgroundColor: RULE,
          }}
        />
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
