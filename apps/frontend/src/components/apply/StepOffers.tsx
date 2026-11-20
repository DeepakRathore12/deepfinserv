'use client';

import Link from 'next/link';
import { LENDER_TYPE_LABEL, formatINR, tenureLabel, type OfferSort } from '@dk/shared';
import { cn } from '@/lib/utils';
import type { OfferView, OffersResponse } from './types';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export function StepOffers({
  data,
  loading,
  sort,
  onSort,
  isCard,
  amount,
  onPick,
  onChange,
}: {
  data: OffersResponse | null;
  loading: boolean;
  sort: OfferSort;
  onSort: (s: OfferSort) => void;
  isCard: boolean;
  amount: number;
  onPick: (o: OfferView) => void;
  onChange: () => void;
}) {
  const offers = data?.offers ?? [];
  const title = loading
    ? 'Finding your offers…'
    : offers.length
      ? `${offers.length} ${offers.length === 1 ? 'offer' : isCard ? 'cards' : 'offers'} ready for you`
      : "Let's find the right option";
  return (
    <section className="card-step a-in" aria-labelledby="s3h" aria-busy={loading}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 id="s3h" className="step-h1">
            {title}
          </h1>
          <p className="step-sub">
            Matched to your income. Pick one and we&apos;ll ask only what that lender needs.
          </p>
        </div>
        {!isCard && offers.length > 1 ? (
          <div role="radiogroup" aria-label="Sort offers" className="flex max-w-full overflow-x-auto gap-1 rounded-full bg-surface p-1">
            {(
              [
                ['apr', 'Lowest rate'],
                ['emi', 'Lowest EMI'],
                ['amount', 'Highest amount'],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={sort === k}
                onClick={() => onSort(k)}
                className={cn(
                  'min-h-9 sm:min-h-10 cursor-pointer rounded-full border-0 px-3 sm:px-3.5 text-xs sm:text-[13.5px] font-semibold whitespace-nowrap',
                  sort === k
                    ? 'bg-white text-navy shadow-[0_1px_3px_rgba(18,22,51,.12)]'
                    : 'bg-transparent text-muted',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[178px] animate-pulse rounded-[22px] bg-surface" />
          ))}
        </div>
      ) : null}

      {!loading && offers.length === 0 ? (
        <div className="flex flex-col gap-3 rounded-[20px] bg-cream p-[22px]">
          <strong className="text-[17px]">No instant match for {formatINR(amount)} yet</strong>
          <span className="text-[15px] leading-relaxed text-[#4A3D1A]">
            On your income, lenders usually approve up to about {formatINR(data?.maxEligible ?? 0)}. Try a
            smaller amount or a longer tenure, or let a loan expert look for lenders with programs for your
            profile. Your request is saved, so an expert may call you.
          </span>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" className="btn btn-primary" onClick={onChange}>
              Change amount or tenure
            </button>
            <Link href="/contact" className="btn btn-ghost">
              Talk to a loan expert
            </Link>
          </div>
        </div>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {offers.map((o, idx) => (
          <li
            key={o.id}
            className={cn(
              'a-up flex flex-col gap-4 rounded-[22px] p-5',
              o.bestMatch ? 'border-2 border-indigo bg-[#FBFBFF]' : 'border-[1.5px] border-line bg-white',
            )}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-[13px] font-bold text-white"
                >
                  {initials(o.lenderName)}
                </span>
                <span className="flex flex-col gap-0.5">
                  <strong className="text-base">{o.lenderName}</strong>
                  <span className="text-[13px] text-muted">
                    {LENDER_TYPE_LABEL[o.lenderType]} ·{' '}
                    {isCard
                      ? 'Credit card'
                      : `${tenureLabel(o.tenureMonths)}, processing fee ${o.processingFeePct}%`}
                  </span>
                </span>
              </span>
              {o.bestMatch ? (
                <span
                  className="rounded-full bg-mint px-[11px] py-[5px] text-xs font-bold text-green"
                  title={o.matchReason}
                >
                  Best match
                </span>
              ) : !o.fullAmount ? (
                <span className="rounded-full bg-cream px-[11px] py-[5px] text-xs font-bold text-[#8A5400]">
                  Lower amount
                </span>
              ) : null}
            </div>
            <dl className="m-0 grid grid-cols-3 gap-2 sm:gap-3">
              <Stat k="APR" v={`${o.apr.toFixed(2)}%`} />
              <Stat
                k={isCard ? 'Monthly' : 'EMI'}
                v={isCard ? `${(o.apr / 12).toFixed(2)}%` : formatINR(o.emi)}
              />
              <Stat k={isCard ? 'Limit up to' : 'Amount'} v={formatINR(o.amount)} />
            </dl>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F6] pt-3.5">
              <span className="flex flex-col gap-0.5 text-xs sm:text-[13px]">
                <span className="font-semibold text-green">{o.matchReason}</span>
                {o.kfsUrl ? (
                  <a href={o.kfsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold">
                    Key Fact Statement
                  </a>
                ) : null}
              </span>
              <button type="button" className="btn btn-primary min-h-11 sm:min-h-[46px] w-full sm:w-auto" onClick={() => onPick(o)}>
                Choose this offer
              </button>
            </div>
          </li>
        ))}
      </ul>
      {offers.length ? (
        <p className="field-hint m-0">
          Offers are indicative and listed by the sort you choose; we do not rank lenders by what they pay us.
          The lender confirms final terms after checking your documents.
        </p>
      ) : null}
      <div className="step-actions justify-start">
        <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onChange}>
          Change my request
        </button>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs sm:text-[12.5px] text-muted">{k}</dt>
      <dd className="m-0 text-base sm:text-lg font-bold">{v}</dd>
    </div>
  );
}
