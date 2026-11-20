import Link from 'next/link';

const TYPES = [
  {
    t: 'Public sector banks',
    d: 'Lowest rates for home and education loans, if your papers are in order.',
    bg: 'bg-lilac',
    ink: 'text-[#3B4060]',
    stroke: '#2B3A9A',
    icon: <path d="M4 27h24M6 27V13M26 27V13M11 27V13M16 27V13M21 27V13M3 13l13-8 13 8z" />,
  },
  {
    t: 'Private sector banks',
    d: 'Fast, digital approvals for salaried borrowers with good credit.',
    bg: 'bg-surface',
    ink: 'text-[#3B4060]',
    stroke: '#2B3A9A',
    icon: (
      <>
        <rect x="5" y="9" width="22" height="18" rx="2" />
        <path d="M11 9V5h10v4M5 16h22" />
      </>
    ),
  },
  {
    t: 'NBFCs',
    d: 'Flexible on income proof and credit history. Good for self-employed borrowers.',
    bg: 'bg-cream',
    ink: 'text-[#4A3D1A]',
    stroke: '#B26B00',
    icon: (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M12 12h8M12 16h8M16 16l-4 6" />
      </>
    ),
  },
  {
    t: 'Housing finance companies',
    d: 'Home loans and loans against property, including for under-construction homes.',
    bg: 'bg-mint',
    ink: 'text-[#1F3D31]',
    stroke: '#0B6E4C',
    icon: (
      <>
        <path d="M5 15L16 6l11 9" />
        <path d="M8 13v14h16V13" />
        <path d="M13 27v-7h6v7" />
      </>
    ),
  },
];

export function LenderTypes() {
  return (
    <section>
      <div className="container-site flex flex-col gap-8 sm:gap-10 py-12 sm:py-16 md:py-[104px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-display m-0 max-w-[620px]">Every kind of lender, in one place</h2>
          <p className="m-0 max-w-[400px] text-base leading-relaxed text-muted">
            Banks are cheaper, NBFCs say yes more often. We match you to the one that fits your profile.
          </p>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-0">
          {TYPES.map((x) => (
            <li key={x.t} className={`reveal flex flex-col gap-3 rounded-[26px] p-5 sm:p-[26px] ${x.bg}`}>
              <svg
                aria-hidden="true"
                width="34"
                height="34"
                viewBox="0 0 32 32"
                fill="none"
                stroke={x.stroke}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {x.icon}
              </svg>
              <strong className="font-display text-[21px] tracking-[-0.4px]">{x.t}</strong>
              <span className={`text-[14.5px] leading-[1.55] ${x.ink}`}>{x.d}</span>
            </li>
          ))}
        </ul>
        <p className="m-0 text-sm text-muted">
          All our lending partners are regulated by the RBI or the NHB.{' '}
          <Link href="/lending-partners" className="font-bold">
            See our full partner list
          </Link>
        </p>
      </div>
    </section>
  );
}
