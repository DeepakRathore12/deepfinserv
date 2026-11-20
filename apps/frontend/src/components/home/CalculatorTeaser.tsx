import Link from 'next/link';
import { EmiCard } from '../calculators/EmiCard';

const LINKS = [
  { href: '/calculators/eligibility', t: 'Loan eligibility', d: 'How much can you borrow?' },
  { href: '/calculators/balance-transfer', t: 'Balance transfer savings', d: 'What you save by switching' },
  { href: '/calculators/prepayment', t: 'Prepayment', d: 'Close your loan sooner' },
  { href: '/calculators/eligibility', t: 'Home loan affordability', d: 'What home fits your income' },
];

export function CalculatorTeaser() {
  return (
    <section id="calculators" className="bg-surface">
      <div className="container-site flex flex-col gap-8 sm:gap-11 py-12 sm:py-16 md:py-[104px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-display m-0">Plan before you borrow</h2>
          <Link
            href="/calculators/emi"
            className="inline-flex min-h-[46px] items-center rounded-full border border-indigo/30 px-5 text-[15px] font-bold text-indigo no-underline"
          >
            All calculators
          </Link>
        </div>
        <div className="flex flex-wrap gap-[18px]">
          <EmiCard />
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
            {LINKS.map((l) => (
              <Link
                key={l.t}
                href={l.href}
                className="lift flex items-center justify-between gap-3 rounded-[22px] bg-white px-[22px] py-5 text-ink no-underline hover:text-ink"
              >
                <span className="flex flex-col gap-[3px]">
                  <span className="text-base font-bold">{l.t}</span>
                  <span className="text-[13.5px] text-muted">{l.d}</span>
                </span>
                <span className="text-[13px] font-bold text-indigo">Try now</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
