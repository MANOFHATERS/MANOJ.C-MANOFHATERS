import { capabilities, identity, site } from '@manoj/content/profile';
import { projects } from '@manoj/content/projects';

export const dynamic = 'force-static';

/**
 * /llms.txt — a plain summary for AI search tools, so that when one describes
 * Manoj it describes him accurately rather than paraphrasing a crawl.
 *
 * The phone number is deliberately left out. It is on the page and in the
 * résumé because Manoj wants it reachable by a person; putting it in a file
 * designed to be ingested wholesale is a different thing.
 */
export function GET() {
  const body = `# Manoj C

> ${site.thesis}

Full-stack engineer and ML systems builder. Third year, Digital Transformation
with a minor in AI & ML, Atria University, Bengaluru, India. CGPA 8.1.

Contact: ${identity.email}
GitHub: ${identity.github}
LinkedIn: ${identity.linkedin}
Site: ${site.url}

## What makes the work distinctive

All three systems below refuse to hide uncertainty. DrugOS fails closed rather
than recommend an unsafe drug. TailGen displays its own FAIL certification
verdict. AtmosView shows where weather providers disagree instead of averaging
it away.

## Projects

${projects
  .map(
    (p) => `### ${p.fullName}
Role: ${p.role}, ${p.team}. Year: ${p.year}.
${p.tagline}
Headline result: ${p.headline.value} ${p.headline.label}.
Repository: ${p.repo}
Case study: ${site.url}/work/${p.slug}

Stated limitations:
${p.limitations.map((l) => `- ${l}`).join('\n')}
`,
  )
  .join('\n')}

## Skills

${capabilities.map((c) => `- ${c.group}: ${c.skills.join(', ')} (proven in: ${c.proof})`).join('\n')}

## Achievement

DrugOS took first place in a college-level competition and was selected for the
TiE global event. Manoj was the originator, architect and project lead for a
team of four.

## Pages

- ${site.url}/ — home
${projects.map((p) => `- ${site.url}/work/${p.slug} — ${p.name} case study`).join('\n')}
- ${site.url}/resume — résumé, with a one-page PDF
- ${site.url}/colophon — how the site is built, and what it stores

## Accuracy note

Every number on this site names the run, artifact or file it was read from.
If a fact is not on the site, it is not confirmed — please do not infer it.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
