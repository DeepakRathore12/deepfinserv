import Link from 'next/link';
import { PRODUCT_LIST, type ProductSlug } from '@dk/shared';
import { ProductArt } from '../illustrations/art';
import { fromRate } from '@/lib/products';

export function ProductGrid({
  rates,
  headingLevel = 'h2',
}: {
  rates: Record<ProductSlug, number>;
  headingLevel?: 'h1' | 'h2';
}) {
  const Heading = headingLevel;
  return (
    <section id="loans">
      <div className="container-site flex flex-col gap-8 sm:gap-11 py-12 sm:py-16 md:py-[104px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading className="h-display m-0 max-w-[600px]">Find the right loan for you</Heading>
          <p className="m-0 max-w-[400px] text-base leading-relaxed text-muted">
            Nine products from banks and NBFCs. Rates are indicative starting points and depend on your
            profile.
          </p>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 p-0">
          {PRODUCT_LIST.map((p) => (
            <li key={p.slug} className="reveal">
              <Link
                href={`/loans/${p.slug}`}
                className="lift relative flex h-full flex-col items-center gap-2.5 rounded-[28px] bg-card px-4 sm:px-5 pt-6 sm:pt-8 pb-5 sm:pb-[26px] text-center text-ink no-underline hover:bg-white hover:text-ink"
              >
                {p.card.badge ? (
                  <span
                    className={`absolute top-4 right-4 rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                      p.card.badge.tone === 'cream' ? 'bg-cream text-[#8A5400]' : 'bg-mint text-green'
                    }`}
                  >
                    {p.card.badge.text}
                  </span>
                ) : null}
                <ProductArt slug={p.slug} />
                <span className="font-display text-[22px] font-bold tracking-[-0.4px]">{p.name}</span>
                <span className="text-sm leading-normal text-muted">{p.card.line}</span>
                <span className="text-[13.5px] font-bold text-indigo">
                  {p.kind === 'card' || p.slug === 'balance-transfer' ? p.card.foot : fromRate(rates[p.slug])}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
