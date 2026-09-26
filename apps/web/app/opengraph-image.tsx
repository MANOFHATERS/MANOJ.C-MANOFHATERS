import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const alt = 'Manoj C — I build systems that tell the truth, especially when the truth is inconvenient.';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg({
    mark: '01',
    kicker: 'Manoj C · Bengaluru',
    title: 'I build systems that tell the truth, especially when the truth is inconvenient.',
    standfirst: 'Full-stack engineer and ML systems builder. Three shipped systems, each one stating its own limits.',
    facts: [
      ['1st place', 'DrugOS'],
      ['Selected', 'TiE global event'],
      ['8.1', 'CGPA'],
    ],
    specimen: 'graph',
    titleSize: 58,
  });
}
