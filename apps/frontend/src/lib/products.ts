import { PRODUCTS, type ProductSlug } from '@dk/shared';
import { api } from './api';

export interface ProductRate {
  slug: ProductSlug;
  aprFrom: number | null;
}

/**
 * Starting APR per product from live rate cards. Falls back to the catalogue's indicative rate when the
 * API is unreachable (for example during a static build without a database).
 */
export async function getStartingRates(): Promise<Record<ProductSlug, number>> {
  const fallback = Object.fromEntries(
    Object.values(PRODUCTS).map((p) => [p.slug, p.indicativeRate]),
  ) as Record<ProductSlug, number>;
  try {
    const res = await api<{ data: ProductRate[] }>('/products', {
      next: { revalidate: 300, tags: ['rates'] },
    });
    for (const r of res.data) if (r.aprFrom != null) fallback[r.slug] = r.aprFrom;
  } catch {
    /* keep indicative rates */
  }
  return fallback;
}

export const fromRate = (rate: number) => `From ${rate.toFixed(2)}% p.a.`;
