import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { OfferBanners } from '@/components/home/OfferBanners';
import { ProductGrid } from '@/components/home/ProductGrid';
import { Process } from '@/components/home/Process';
import { CreditTeaser } from '@/components/home/CreditTeaser';
import { CalculatorTeaser } from '@/components/home/CalculatorTeaser';
import { LenderTypes } from '@/components/home/LenderTypes';
import { PartnerBanks } from '@/components/home/PartnerBanks';
import { HomeFaq } from '@/components/home/HomeFaq';
import { MostSearched } from '@/components/home/MostSearched';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/ui/JsonLd';
import { getStartingRates } from '@/lib/products';
import { organizationLd, pageMetadata, webPageLd, websiteLd } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'DeepFinServ: Get Loans from Top Banks and NBFCs',
    description: SITE.description,
    path: '/',
  }),
  title: { absolute: 'DeepFinServ: Get Loans from Top Banks and NBFCs' },
};

export default async function HomePage() {
  const rates = await getStartingRates();
  return (
    <>
      <JsonLd data={[organizationLd(), websiteLd(), webPageLd('DeepFinServ', '/', SITE.description)]} />
      <Hero />
      <PartnerBanks />
      <OfferBanners btRate={rates['balance-transfer']} />
      <ProductGrid rates={rates} />
      <Process />
      {/* <CreditTeaser /> -- Disabled credit score check */}
      <CalculatorTeaser />
      <LenderTypes />
      <HomeFaq />
      <MostSearched />
      <SiteFooter />
    </>
  );
}
