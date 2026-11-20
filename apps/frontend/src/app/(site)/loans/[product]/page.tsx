import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PRODUCT_LIST, PRODUCT_SLUGS, PRODUCTS, isProductSlug } from '@dk/shared';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/ui/JsonLd';
import { QuickEmi } from '@/components/product/QuickEmi';
import { ProductTabs } from '@/components/product/ProductTabs';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getStartingRates } from '@/lib/products';
import { breadcrumbLd, pageMetadata, serviceLd } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((product) => ({ product }));
}

type Params = { params: Promise<{ product: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { product } = await params;
  if (!isProductSlug(product)) return {};
  const p = PRODUCTS[product];
  return pageMetadata({ title: p.meta.title, description: p.meta.description, path: `/loans/${p.slug}` });
}

const CARD_TYPES = [
  { t: 'Cashback', d: 'Flat cashback on every spend' },
  { t: 'Travel', d: 'Air miles and lounge access' },
  { t: 'Fuel', d: 'Surcharge waiver and fuel points' },
  { t: 'Lifetime free', d: 'No joining or annual fee' },
];

export default async function ProductPage({ params }: Params) {
  const { product } = await params;
  if (!isProductSlug(product)) notFound();
  const p = PRODUCTS[product];
  const rates = await getStartingRates();
  const rate = rates[p.slug];
  const stats =
    p.kind === 'loan' && p.stats[0]
      ? [{ ...p.stats[0], v: `${rate.toFixed(2)}% p.a.` }, ...p.stats.slice(1)]
      : p.stats;
  const path = `/loans/${p.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Loans', path: '/loans' },
    { name: p.name, path },
  ];
  const idx = PRODUCT_SLUGS.indexOf(p.slug);
  const related = [1, 2, 3].map((n) => PRODUCT_LIST[(idx + n) % PRODUCT_LIST.length]!);

  return (
    <>
      <JsonLd data={[serviceLd(p.name, path, p.meta.description), breadcrumbLd(crumbs)]} />
      {/* Top product navigation bar removed as requested
      <nav aria-label="Products" className="border-b border-hairline bg-white">
        <ul className="container-site m-0 flex list-none gap-1.5 overflow-x-auto py-2.5">
          {PRODUCT_LIST.map((x) => (
            <li key={x.slug}>
              <Link
                href={`/loans/${x.slug}`}
                aria-current={x.slug === p.slug ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-[42px] items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap no-underline transition-colors',
                  x.slug === p.slug
                    ? 'bg-indigo text-white hover:text-white'
                    : 'bg-surface text-ink hover:text-indigo',
                )}
              >
                {x.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      */}

      <section className="bg-surface">
        <div className="container-site flex flex-wrap items-start gap-8 sm:gap-10 pt-8 sm:pt-14 pb-10 sm:pb-16">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-4 sm:gap-[22px]">
            <Breadcrumbs items={crumbs} />
            <h1 className="a-up m-0 font-display text-[clamp(28px,5vw,60px)] leading-[1.05] sm:leading-none font-extrabold tracking-[-1.5px] sm:tracking-[-2px]">
              {p.name}
            </h1>
            <p className="m-0 max-w-[520px] text-base sm:text-lg leading-relaxed text-muted">{p.tag}</p>
            <dl className="m-0 grid max-w-[640px] grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {stats.map((s) => (
                <div key={s.k} className="flex flex-col gap-1 rounded-[18px] bg-white p-3 sm:p-4">
                  <dt className="text-xs sm:text-[12.5px] text-muted">{s.k}</dt>
                  <dd className="m-0 font-display text-lg sm:text-[21px] font-bold tracking-[-0.4px]">{s.v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2.5">
              <Link href={`/apply?product=${p.slug}`} className="btn btn-primary min-h-12 sm:min-h-[54px] text-sm sm:text-base">
                Apply for {p.phrase}
              </Link>
              <Link href="/contact" className="btn btn-ghost min-h-12 sm:min-h-[54px] text-sm sm:text-base">
                Talk to an expert
              </Link>
            </div>
          </div>
          <div className="a-up d2 max-w-[460px] min-w-0 flex-[1_1_360px] rounded-[30px] bg-white/60 p-1 sm:p-2">
            <div className="flex flex-col gap-4 sm:gap-[18px] rounded-3xl bg-white p-4 sm:p-[26px]">
              {p.kind === 'loan' ? (
                <QuickEmi product={p} rate={rate} />
              ) : (
                <>
                  <h2 className="m-0 font-display text-xl font-bold">Find your card by how you spend</h2>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {CARD_TYPES.map((c) => (
                      <li
                        key={c.t}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3.5"
                      >
                        <span className="flex flex-col gap-0.5">
                          <strong className="text-[15px]">{c.t}</strong>
                          <span className="text-[13px] text-muted">{c.d}</span>
                        </span>
                        <Link href="/apply?product=credit-cards" className="text-[13.5px] font-bold">
                          Compare
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-site pt-8 sm:pt-14 pb-12 sm:pb-[88px]">
          <h2 className="sr-only">{p.name} details</h2>
          <ProductTabs p={p} />
        </div>
      </section>

      <section className="bg-surface">
        <div className="container-site flex flex-col gap-5 py-10 sm:py-16">
          <h2 className="m-0 font-display text-2xl sm:text-[28px] font-extrabold tracking-[-0.8px]">
            You might also need
          </h2>
          <ul className="m-0 grid list-none grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-0">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/loans/${r.slug}`}
                  className="lift flex h-full flex-col gap-1.5 rounded-[22px] bg-white p-[22px] text-ink no-underline hover:text-ink"
                >
                  <strong className="text-[17px]">{r.name}</strong>
                  <span className="text-sm text-muted">{r.tag}</span>
                  <span className="pt-1.5 text-[13.5px] font-bold text-indigo">View details</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <SiteFooter withCta={false} />
    </>
  );
}
