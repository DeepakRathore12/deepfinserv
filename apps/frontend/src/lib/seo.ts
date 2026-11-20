import type { Metadata } from 'next';
import { SITE } from './site';

interface PageMeta {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

export function pageMetadata({ title, description, path, noindex }: PageMeta): Metadata {
  const url = `${SITE.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE.name, type: 'website', locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title, description },
    robots: noindex || !allowIndexing ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  description: SITE.description,
  areaServed: 'IN',
});

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
});

export const webPageLd = (name: string, path: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  description,
  url: `${SITE.url}${path}`,
});

export const breadcrumbLd = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: `${SITE.url}${c.path}`,
  })),
});

export const serviceLd = (name: string, path: string, description: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: name,
  name,
  description,
  url: `${SITE.url}${path}`,
  areaServed: 'IN',
  provider: { '@type': 'FinancialService', name: SITE.name, url: SITE.url },
});
