'use client';

import Link from 'next/link';
import { useState } from 'react';
import { emi, formatINR, tenureLabel, type Product } from '@dk/shared';

export function QuickEmi({ product, rate }: { product: Pick<Product, 'amount' | 'tenure'>; rate: number }) {
  const [amt, setAmt] = useState(product.amount.default);
  const [ten, setTen] = useState(product.tenure.default);
  return (
    <>
      <h2 className="m-0 font-display text-xl font-bold">Quick EMI check</h2>
      <label className="flex flex-col gap-2">
        <span className="flex justify-between text-sm">
          <span className="font-semibold text-muted">Amount</span>
          <strong>{formatINR(amt)}</strong>
        </span>
        <input
          type="range"
          min={product.amount.min}
          max={product.amount.max}
          step={product.amount.step}
          value={amt}
          aria-valuetext={formatINR(amt)}
          onChange={(e) => setAmt(Number(e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="flex justify-between text-sm">
          <span className="font-semibold text-muted">Tenure</span>
          <strong>{tenureLabel(ten)}</strong>
        </span>
        <input
          type="range"
          min={product.tenure.min}
          max={product.tenure.max}
          step={product.tenure.step}
          value={ten}
          aria-valuetext={tenureLabel(ten)}
          onChange={(e) => setTen(Number(e.target.value))}
        />
      </label>
      <div
        className="flex items-end justify-between gap-3 rounded-[18px] bg-indigo p-[18px] text-white"
        aria-live="polite"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-xs sm:text-[13px] text-on-navy">EMI from</span>
          <strong className="font-display text-[24px] sm:text-[32px] tracking-[-1px]">
            {formatINR(emi(amt, rate, ten))}
          </strong>
        </span>
        <span className="text-right text-xs text-on-navy">
          at {rate.toFixed(2)}% p.a.
          <br />
          illustrative
        </span>
      </div>
      <Link href="/calculators/emi" className="btn btn-ghost min-h-11 text-sm">
        Open full calculators
      </Link>
    </>
  );
}
