import type { MetadataRoute } from 'next';
import { site } from '@manoj/content/profile';
import { projects } from '@manoj/content/projects';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${site.url}/resume`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...projects.map((p) => ({
      url: `${site.url}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
