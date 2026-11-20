import Link from 'next/link';
import { CoinsArt, GaugeArt, HouseArt } from '../illustrations/art';

const pill = 'self-start rounded-full px-[18px] py-2.5 text-sm font-bold';

export function OfferBanners({ btRate }: { btRate: number }) {
  return (
    <section aria-label="Current offers">
      <div className="container-site flex gap-3 sm:gap-4 overflow-x-auto pt-8 sm:pt-14 pb-2">
        <Link
          href="/loans/personal-loan"
          className="lift relative flex min-h-[190px] sm:min-h-[210px] flex-[1_0_280px] sm:flex-[1_0_360px] justify-between gap-4 overflow-hidden rounded-[28px] bg-indigo p-5 sm:p-7 text-white no-underline hover:text-white"
        >
          <span className="relative flex max-w-[230px] flex-col justify-between gap-3 sm:gap-[18px]">
            <span className="font-display text-xl sm:text-2xl leading-[1.15] sm:leading-[1.12] font-bold tracking-[-0.5px]">
              Personal loan up to ₹40 lakh, with quick approvals
            </span>
            <span className={`${pill} bg-white text-indigo`}>Apply now</span>
          </span>
          <CoinsArt />
        </Link>
        <Link
          href="/calculators/balance-transfer"
          className="lift flex min-h-[190px] sm:min-h-[210px] flex-[1_0_280px] sm:flex-[1_0_360px] justify-between gap-4 rounded-[28px] bg-cream p-5 sm:p-7 text-ink no-underline hover:text-ink"
        >
          <span className="flex max-w-[230px] flex-col justify-between gap-3 sm:gap-[18px]">
            <span className="font-display text-xl sm:text-2xl leading-[1.15] sm:leading-[1.12] font-bold tracking-[-0.5px]">
              Paying too much EMI on your home loan?
            </span>
            <span className="flex flex-col gap-2.5 sm:gap-3.5">
              <span className="text-xs sm:text-sm text-[#5C4A1E]">
                Switch to rates from {btRate.toFixed(2)}% p.a. and cut your EMI.
              </span>
              <span className={`${pill} bg-ink text-white`}>Check savings</span>
            </span>
          </span>
          <HouseArt />
        </Link>
        {/* Credit score check banner temporarily disabled
        <Link
          href="/credit-score"
          className="lift flex min-h-[210px] flex-[1_0_360px] justify-between gap-4 rounded-[28px] bg-mint p-7 text-ink no-underline hover:text-ink"
        >
          <span className="flex max-w-[230px] flex-col justify-between gap-[18px]">
            <span className="font-display text-2xl leading-[1.12] font-bold tracking-[-0.5px]">
              Your CIBIL score and full report, free
            </span>
            <span className="flex flex-col gap-3.5">
              <span className="text-sm text-[#245B44]">Takes 30 seconds. Never lowers your score.</span>
              <span className={`${pill} bg-green text-white`}>Get free score</span>
            </span>
          </span>
          <GaugeArt />
        </Link>
        */}
      </div>
    </section>
  );
}
