import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * The section mark in pigment on paper — the same device the site numbers its
 * sections with, and the same one the DrugOS specification used.
 */
export default async function AppleIcon() {
  const serif = await readFile(
    path.join(process.cwd(), 'assets', 'fonts', 'Newsreader-Static.ttf'),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF9F6',
          fontFamily: 'Newsreader',
          fontSize: 120,
          color: '#002FA7',
        }}
      >
        M
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Newsreader', data: serif, weight: 400, style: 'normal' }],
    },
  );
}
