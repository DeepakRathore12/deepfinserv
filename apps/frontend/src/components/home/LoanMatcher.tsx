'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PRODUCT_LIST, PRODUCTS, mobileSchema, type ProductSlug } from '@dk/shared';
import { ProductIcon } from '../illustrations/ProductIcon';
import { ArrowChip } from '../ui/ArrowChip';
import { Field } from '../forms/Field';
import { digitsOnly, formatRupeeInput, toRupees } from '../forms/inputs';
import { saveHandoff } from '@/lib/handoff';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/** Hero loan matcher: product, amount and mobile, then on to the application with these prefilled. */
export function LoanMatcher() {
  const router = useRouter();
  const [product, setProduct] = useState<ProductSlug>('personal-loan');
  const [amount, setAmount] = useState('');
  const [mobile, setMobile] = useState('');
  const [tried, setTried] = useState(false);

  const p = PRODUCTS[product];
  const amountOk = toRupees(amount) >= 10000;
  const mobileOk = mobileSchema.safeParse(mobile).success;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (!amountOk || !mobileOk) return;
    saveHandoff({ product, amount: toRupees(amount), mobile });
    track('loan_matcher_start', { product });
    router.push(`/apply?product=${product}`);
  }

  return (
    <div className="a-up d4 max-w-[500px] min-w-0 flex-[1_1_420px] rounded-[32px] border border-white/90 bg-white/55 p-1.5 sm:p-2 shadow-[0_30px_60px_-20px_rgba(43,58,154,.25)]">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4 sm:gap-5 rounded-[26px] bg-white p-4 sm:p-7">
        <div className="flex items-baseline justify-between gap-2 sm:gap-3">
          <h2 className="m-0 font-display text-xl sm:text-[23px] font-bold tracking-[-0.5px]">
            What are you looking for?
          </h2>
          <span className="text-xs sm:text-[13px] whitespace-nowrap text-muted">Takes 60 seconds</span>
        </div>
        <div role="radiogroup" aria-label="Product" className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {PRODUCT_LIST.map((item) => {
            const on = item.slug === product;
            return (
              <button
                key={item.slug}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setProduct(item.slug)}
                className={cn(
                  'flex min-h-[72px] sm:min-h-[78px] cursor-pointer flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-2xl border-[1.5px] px-1 py-2 sm:py-2.5 text-xs sm:text-[13px] leading-tight font-semibold text-ink transition-colors',
                  on ? 'border-indigo bg-lilac' : 'border-line bg-white hover:border-[#c9ceee]',
                )}
              >
                <ProductIcon slug={item.slug} />
                {item.short}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Field
            className="flex-[1_1_160px]"
            label={p.kind === 'card' ? 'Credit limit wanted' : 'Loan amount'}
            error={tried && !amountOk ? 'Enter an amount of ₹10,000 or more' : undefined}
          >
            <input
              className="field-input"
              inputMode="numeric"
              placeholder="₹ 5,00,000"
              value={amount}
              aria-invalid={tried && !amountOk}
              onChange={(e) => setAmount(formatRupeeInput(e.target.value))}
            />
          </Field>
          <Field
            className="flex-[1_1_160px]"
            label="Mobile number"
            error={tried && !mobileOk ? 'Enter a valid 10-digit mobile number' : undefined}
          >
            <input
              className="field-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="10-digit number"
              value={mobile}
              aria-invalid={tried && !mobileOk}
              onChange={(e) => setMobile(digitsOnly(e.target.value, 10))}
            />
          </Field>
        </div>
        <button
          type="submit"
          className="group flex min-h-12 sm:min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-full border-0 bg-indigo py-0 pr-2 pl-4 sm:pl-6 text-sm sm:text-base font-bold text-white transition-colors hover:bg-navy"
        >
          <span>See my {p.ctaName} offers</span>
          <ArrowChip pulse />
        </button>
        <div className="flex flex-wrap justify-between gap-2 text-[13px] text-muted">
          <span className="flex items-center gap-1.5">
            <Check aria-hidden size={14} strokeWidth={2.4} className="text-green" />
            Free. No impact on your CIBIL score
          </span>
          <Link href="/contact" className="font-semibold">
            Prefer a call? Request one
          </Link>
        </div>
      </form>
    </div>
  );
}
