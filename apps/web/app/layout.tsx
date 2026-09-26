import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Newsreader, Schibsted_Grotesk } from 'next/font/google';

import { identity, site } from '@manoj/content/profile';
import { projects } from '@manoj/content/projects';
import { Masthead } from '@/components/Masthead';
import { Footer } from '@/components/Footer';
import { AskProvider } from '@/components/ask/AskProvider';

import './globals.css';

/* Self-hosted, subset, and served from the site's own origin — which is also
   why the CSP can say font-src 'self' and mean it. */

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  axes: ['opsz'],
  // size-adjust via the fallback keeps the swap from shifting layout
  adjustFontFallback: true,
});

const grotesk = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: '%s — Manoj C',
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: identity.name, url: site.url }],
  creator: identity.name,
  keywords: [
    'Manoj C',
    'full-stack engineer',
    'ML systems',
    'machine learning',
    'Bengaluru',
    'Atria University',
    'PyTorch',
    'Next.js',
    'drug repurposing',
    'diffusion models',
    'portfolio',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // The browser chrome colour cannot read a CSS variable, so --color-paper
  // is repeated here literally. It is the only place on the site that does.
  themeColor: '#F6F2EA',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

/**
 * JSON-LD. The phone number is deliberately absent: it is on the page and in
 * the résumé because Manoj wants it reachable, but putting it in structured
 * data hands it to every scraper that reads this file. See PRD §14.
 */
function StructuredData() {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: identity.name,
    jobTitle: 'Full-stack engineer, ML systems',
    url: site.url,
    email: `mailto:${identity.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Atria University',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bengaluru',
        addressCountry: 'IN',
      },
    },
    knowsAbout: [
      'Machine learning systems',
      'Graph neural networks',
      'Diffusion models',
      'Reinforcement learning',
      'Full-stack web engineering',
      'Data pipelines',
    ],
    sameAs: [identity.github, identity.linkedin],
  };

  const software = projects.map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: p.fullName,
    description: p.tagline,
    codeRepository: p.repo,
    url: `${site.url}/work/${p.slug}`,
    programmingLanguage: p.stack.slice(0, 4),
    author: { '@type': 'Person', name: identity.name },
  }));

  return (
    <script
      type="application/ld+json"
      // Static, build-time JSON from our own content file.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([person, ...software]),
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${newsreader.variable} ${grotesk.variable} ${plexMono.variable}`}
    >
      <head>
        <StructuredData />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <AskProvider>
          <Masthead />
          <main id="main">{children}</main>
          <Footer />
        </AskProvider>
      </body>
    </html>
  );
}
