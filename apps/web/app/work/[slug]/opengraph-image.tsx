import { projectBySlug, projects } from '@manoj/content/projects';
import { renderOg, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';

export const alt = 'Case study';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug) ?? projects[0];

  return renderOg({
    mark: `03.${p.index}`,
    kicker: `${p.role} · ${p.year}`,
    title: p.name,
    standfirst: p.tagline,
    facts: [
      [p.headline.value, p.headline.label],
      [p.stack.length.toString(), 'technologies'],
      ['Limits', 'stated in full'],
    ],
    titleSize: 92,
  });
}
