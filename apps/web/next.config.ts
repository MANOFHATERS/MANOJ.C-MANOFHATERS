import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Security headers (PRD §14). The CSP is deliberately tight: the only
 * third-party origin allowed is Cloudflare Turnstile, and the API origin is
 * injected from the environment so a custom domain needs no code change.
 */
const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? '';

const isDev = process.env.NODE_ENV !== 'production';

const csp = [
  "default-src 'self'",
  // Next injects a small inline bootstrap, so 'unsafe-inline' stays. React's
  // development tooling additionally needs eval() to reconstruct call stacks;
  // that allowance exists only in `next dev` and never reaches production.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  `connect-src 'self' ${apiOrigin} https://challenges.cloudflare.com`.trim(),
  'frame-src https://challenges.cloudflare.com',
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // The content package lives outside this app; trace from the repo root so
  // Vercel bundles it correctly.
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),

  images: {
    // Images are pre-optimised at build time, so the Vercel Hobby transform
    // quota (5,000/month) is never touched.
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/Manoj-C-Resume.pdf',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'attachment; filename="Manoj-C-Resume.pdf"',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/resume.pdf', destination: '/Manoj-C-Resume.pdf', permanent: true },
      { source: '/cv', destination: '/resume', permanent: true },
    ];
  },
};

export default nextConfig;
