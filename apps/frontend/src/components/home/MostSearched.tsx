import Link from 'next/link';

/** Internal links to existing pages only. City or long-tail pages are added here as they are published. */
const GROUPS = [
  {
    t: 'Personal loan',
    links: [
      { href: '/loans/personal-loan', l: 'Personal loan interest rates' },
      { href: '/calculators/eligibility', l: 'Personal loan eligibility' },
      { href: '/calculators/emi', l: 'Personal loan EMI calculator' },
      { href: '/loans/balance-transfer', l: 'Personal loan balance transfer' },
    ],
  },
  {
    t: 'Home loan',
    links: [
      { href: '/loans/home-loan', l: 'Home loan interest rates' },
      { href: '/calculators/balance-transfer', l: 'Home loan balance transfer savings' },
      { href: '/calculators/prepayment', l: 'Home loan prepayment calculator' },
      { href: '/loans/loan-against-property', l: 'Loan against property' },
    ],
  },
  /*
  {
    t: 'CIBIL score',
    links: [
      { href: '/credit-score', l: 'Check CIBIL score free' },
      { href: '/credit-score#improve', l: 'How to improve your CIBIL score' },
      { href: '/credit-score#bands', l: 'What is a good CIBIL score' },
      { href: '/loans/credit-cards', l: 'Credit cards to build your score' },
    ],
  },
  */
  {
    t: 'Calculators',
    links: [
      { href: '/calculators/emi', l: 'EMI calculator' },
      { href: '/calculators/eligibility', l: 'Loan eligibility calculator' },
      { href: '/calculators/balance-transfer', l: 'Balance transfer calculator' },
      { href: '/calculators/prepayment', l: 'Prepayment calculator' },
    ],
  },
];

export function MostSearched() {
  return (
    <section aria-labelledby="most-searched">
      <div className="container-site flex flex-col gap-6 sm:gap-7 py-10 sm:py-16 md:py-20">
        <h2 id="most-searched" className="m-0 font-display text-[22px] sm:text-[26px] font-bold tracking-[-0.6px]">
          Most searched
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 text-sm">
          {GROUPS.map((g) => (
            <div key={g.t} className="flex flex-col gap-2.5">
              <span className="text-[15px] font-bold">{g.t}</span>
              {g.links.map((l) => (
                <Link key={l.l} href={l.href} className="text-muted no-underline hover:text-indigo">
                  {l.l}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
