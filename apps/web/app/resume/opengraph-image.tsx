import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const alt = 'Manoj C — résumé';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg({
    mark: '10',
    kicker: 'Résumé',
    title: 'Manoj C',
    standfirst: 'Full-stack engineer and ML systems. One page, generated from the same content as the site.',
    facts: [
      ['3', 'systems shipped'],
      ['8.1', 'CGPA'],
      ['PDF', 'one page, ATS-readable'],
    ],
    titleSize: 84,
  });
}
