import { LoanMatcher } from './LoanMatcher';

const STATS = [
  { v: '₹0', k: 'Our fee to you' },
  { v: '2 min', k: 'To see your offers' },
  { v: '9', k: 'Loan and card products' },
  { v: '1 expert', k: 'With you till disbursal' },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-surface">
      <svg
        aria-hidden="true"
        viewBox="0 0 600 600"
        className="absolute -top-[120px] -right-[140px] h-[680px] w-[680px]"
      >
        <circle cx="300" cy="300" r="290" fill="#FFE7B8" />
        <g className="a-spin">
          <circle
            cx="300"
            cy="300"
            r="210"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="2 14"
            strokeLinecap="round"
            opacity=".9"
          />
          <circle cx="300" cy="300" r="130" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity=".7" />
        </g>
      </svg>
      <div className="container-site relative flex flex-wrap items-center gap-8 sm:gap-14 pt-8 sm:pt-[72px] pb-10 sm:pb-16">
        <div className="flex min-w-0 flex-[1_1_500px] flex-col gap-4 sm:gap-[26px]">
          <span className="a-up inline-flex items-center gap-2 self-start rounded-full bg-white py-1.5 pr-3.5 pl-1.5 text-xs sm:text-[13px] font-semibold shadow-[0_1px_2px_rgba(18,22,51,.06)]">
            <span className="rounded-full bg-mint px-2.5 py-[3px] font-bold text-green">New</span>
            Free credit report with every application
          </span>
          <h1 className="a-up d1 m-0 max-w-[620px] font-display text-[clamp(32px,5.8vw,72px)] leading-[1.05] sm:leading-[0.98] font-extrabold tracking-[-1.5px] sm:tracking-[-2.6px]">
            One application. Offers from top banks and NBFCs.
          </h1>
          <p className="a-up d2 m-0 max-w-[480px] text-base sm:text-lg leading-relaxed text-muted">
            Tell us what you need and see the offers you qualify for in two minutes. A DeepFinServ loan expert
            then handles the paperwork until the money is in your account.
          </p>
          <dl className="a-up d3 m-0 grid max-w-[600px] grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1.5">
            {STATS.map((s) => (
              <div key={s.k} className="flex flex-col-reverse gap-0.5 rounded-[18px] bg-white px-3 sm:px-[18px] py-3 sm:py-4">
                <dt className="text-xs sm:text-[13px] text-muted">{s.k}</dt>
                <dd className="m-0 font-display text-[22px] sm:text-[26px] font-extrabold tracking-[-0.8px]">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <LoanMatcher />
      </div>
    </section>
  );
}
