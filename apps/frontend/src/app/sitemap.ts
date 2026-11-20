import type { MetadataRoute } from 'next';
import { CALCULATOR_SLUGS, PRODUCT_SLUGS } from '@dk/shared';
import { SITE } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (
    path: string,
    priority: number,
    changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly',
  ) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page('/', 1, 'daily'),
    page('/loans', 0.9),
    ...PRODUCT_SLUGS.map((s) => page(`/loans/${s}`, 0.9)),
    ...CALCULATOR_SLUGS.map((s) => page(`/calculators/${s}`, 0.7)),
    // page('/credit-score', 0.8),
    page('/contact', 0.5, 'monthly'),
    page('/partner', 0.5, 'monthly'),
    page('/grievance', 0.4, 'monthly'),
    page('/lending-partners', 0.5, 'monthly'),
    page('/about', 0.4, 'monthly'),
    page('/privacy', 0.2, 'monthly'),
    page('/terms', 0.2, 'monthly'),
  ];
}
