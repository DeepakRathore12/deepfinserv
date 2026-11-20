import type { Metadata } from 'next';
import { ProductGrid } from '@/components/home/ProductGrid';
import { LenderTypes } from '@/components/home/LenderTypes';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/ui/JsonLd';
import { getStartingRates } from '@/lib/products';
import { breadcrumbLd, pageMetadata, webPageLd } from '@/lib/seo';

export const revalidate = 300;

const description =
  'Compare personal, home, business, property, education and car loans, balance transfers and credit cards from banks and NBFCs.';

export const metadata: Metadata = pageMetadata({
  title: 'All Loans and Credit Cards',
  description,
  path: '/loans',
});

export default async function LoansPage() {
  const rates = await getStartingRates();
  return (
    <>
      <JsonLd
        data={[
          webPageLd('All loans and credit cards', '/loans', description),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Loans', path: '/loans' },
          ]),
        ]}
      />
      <ProductGrid rates={rates} headingLevel="h1" />
      <LenderTypes />
      <SiteFooter />
    </>
  );
}
