import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  transpilePackages: ['@dk/shared'],
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  /**
   * Local development: proxy /api/v1 to the Express API so the browser stays same-origin (the admin
   * session cookie is SameSite=Strict). In production Nginx routes /api before requests reach Next.
   */
  async rewrites() {
    const target = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';
    return [{ source: '/api/v1/:path*', destination: `${target}/:path*` }];
  },
  async redirects() {
    return [
      { source: '/products', destination: '/loans', permanent: true },
      { source: '/cibil-score', destination: '/credit-score', permanent: true },
      { source: '/calculators', destination: '/calculators/emi', permanent: false },
    ];
  },
};

export default config;
