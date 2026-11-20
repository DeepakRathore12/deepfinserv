import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CALCULATOR_SLUGS, type CalculatorSlug } from '@dk/shared';
import { Calculator } from '@/components/calculators/Calculator';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbLd, pageMetadata, webPageLd } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const dynamicParams = false;
export function generateStaticParams() {
  return CALCULATOR_SLUGS.map((tool) => ({ tool }));
}

const META: Record<CalculatorSlug, { tab: string; title: string; description: string }> = {
  emi: {
    tab: 'EMI',
    title: 'EMI Calculator with Yearly Repayment Schedule',
    description:
      'Work out your monthly EMI, total interest and a year-by-year repayment schedule for any loan.',
  },
  eligibility: {
    tab: 'Eligibility',
    title: 'Loan Eligibility Calculator',
    description: 'See how much you can borrow based on your income, existing EMIs, interest rate and tenure.',
  },
  'balance-transfer': {
    tab: 'Balance transfer',
    title: 'Balance Transfer Savings Calculator',
    description: 'Check how much you save by moving your loan to a lower rate, after the transfer fee.',
  },
  prepayment: {
    tab: 'Prepayment',
    title: 'Loan Prepayment Calculator',
    description:
      'See how much interest you save and how much sooner your loan closes with a part prepayment.',
  },
};

type Params = { params: Promise<{ tool: string }> };
const isTool = (t: string): t is CalculatorSlug => (CALCULATOR_SLUGS as readonly string[]).includes(t);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tool } = await params;
  if (!isTool(tool)) return {};
  return pageMetadata({
    title: META[tool].title,
    description: META[tool].description,
    path: `/calculators/${tool}`,
  });
}

export default async function CalculatorPage({ params }: Params) {
  const { tool } = await params;
  if (!isTool(tool)) notFound();
  const path = `/calculators/${tool}`;
  return (
    <>
      <JsonLd
        data={[
          webPageLd(META[tool].title, path, META[tool].description),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Calculators', path: '/calculators/emi' },
            { name: META[tool].tab, path },
          ]),
        ]}
      />
      <section className="bg-surface">
        <div className="container-site flex flex-col gap-6 sm:gap-7 pt-8 sm:pt-14 pb-12 sm:pb-[88px]">
          <div className="a-up flex max-w-[680px] flex-col gap-2.5 sm:gap-3">
            <h1 className="m-0 font-display text-[clamp(28px,4.8vw,56px)] leading-[1.05] sm:leading-none font-extrabold tracking-[-1.2px] sm:tracking-[-1.8px]">
              Plan before you borrow
            </h1>
            <p className="m-0 text-base sm:text-[17px] leading-relaxed text-muted">
              Work out your EMI, how much you can borrow, and what you save by switching or prepaying.
            </p>
          </div>
          <nav aria-label="Calculators">
            <ul className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 pb-1">
              {CALCULATOR_SLUGS.map((t) => (
                <li key={t}>
                  <Link
                    href={`/calculators/${t}`}
                    aria-current={t === tool ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-10 sm:min-h-[46px] items-center rounded-full border-[1.5px] px-3.5 sm:px-5 text-xs sm:text-[15px] font-semibold whitespace-nowrap no-underline',
                      t === tool
                        ? 'border-indigo bg-indigo text-white hover:text-white'
                        : 'border-line bg-white text-ink hover:border-[#c9ceee]',
                    )}
                  >
                    {META[t].tab}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Calculator tool={tool} />
        </div>
      </section>
      <SiteFooter withCta={false} />
    </>
  );
}
