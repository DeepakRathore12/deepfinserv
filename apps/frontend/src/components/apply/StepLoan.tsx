'use client';

import { useState } from 'react';
import { PRODUCT_LIST, PRODUCTS, amountInWords, loanRequestSchema, tenureLabel } from '@dk/shared';
import { Field } from '../forms/Field';
import { formatRupeeInput, toRupees } from '../forms/inputs';
import { cn } from '@/lib/utils';
import type { LoanDraft } from './types';
import Link from 'next/link';

const chip = (on: boolean) =>
  cn(
    'min-h-12 cursor-pointer rounded-[14px] border-[1.5px] px-4 text-sm font-semibold transition-colors',
    on ? 'border-indigo bg-lilac text-navy' : 'border-line bg-white text-ink hover:border-[#c9ceee]',
  );

export function StepLoan({
  draft,
  onChange,
  onNext,
}: {
  draft: LoanDraft;
  onChange: (d: LoanDraft) => void;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const p = PRODUCTS[draft.product];
  const words = amountInWords(toRupees(draft.amount));

  function next() {
    const r = loanRequestSchema.safeParse({
      ...draft,
      tenureMonths: p.kind === 'card' ? 0 : draft.tenureMonths,
    });
    if (!r.success) {
      const map: Record<string, string> = {};
      for (const i of r.error.issues) map[String(i.path[0])] ??= i.message;
      setErrors(map);
      return;
    }
    setErrors({});
    onNext();
  }

  return (
    <section className="card-step a-in" aria-labelledby="s1h">
      <div className="flex flex-col gap-2">
        <h1 id="s1h" className="step-h1">
          What do you need?
        </h1>
        <p className="step-sub">
          Five quick questions. Then you see real offers, before we ask for your PAN.
        </p>
      </div>
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 text-[13px] font-semibold text-muted">Product</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {PRODUCT_LIST.map((x) => (
            <button
              key={x.slug}
              type="button"
              aria-pressed={x.slug === draft.product}
              className={chip(x.slug === draft.product)}
              onClick={() => onChange({ ...draft, product: x.slug, tenureMonths: x.tenure.default })}
            >
              {x.short}
            </button>
          ))}
        </div>
      </fieldset>
      <Field
        label={p.kind === 'card' ? 'Credit limit you want' : 'How much do you need?'}
        error={errors.amount}
        hint={words || undefined}
      >
        <input
          className="field-input"
          inputMode="numeric"
          placeholder="₹ 5,00,000"
          value={draft.amount}
          aria-invalid={!!errors.amount}
          onChange={(e) => onChange({ ...draft, amount: formatRupeeInput(e.target.value) })}
        />
      </Field>
      {p.kind === 'loan' ? (
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 p-0 text-[13px] font-semibold text-muted">Repay over</legend>
          <div className="flex flex-wrap gap-2">
            {p.tenure.options.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={m === draft.tenureMonths}
                className={chip(m === draft.tenureMonths)}
                onClick={() => onChange({ ...draft, tenureMonths: m })}
              >
                {m % 12 === 0 ? `${m / 12} ${m === 12 ? 'year' : 'years'}` : tenureLabel(m)}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div className="flex flex-wrap gap-4">
        <fieldset className="m-0 flex min-w-0 flex-[1_1_240px] flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 p-0 text-[13px] font-semibold text-muted">You are</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={draft.employment === 'salaried'}
              className={chip(draft.employment === 'salaried')}
              onClick={() => onChange({ ...draft, employment: 'salaried' })}
            >
              Salaried
            </button>
            <button
              type="button"
              aria-pressed={draft.employment === 'self_employed'}
              className={chip(draft.employment === 'self_employed')}
              onClick={() => onChange({ ...draft, employment: 'self_employed' })}
            >
              Self-employed
            </button>
          </div>
        </fieldset>
        <Field
          className="min-w-0 flex-[1_1_240px]"
          label={draft.employment === 'salaried' ? 'Monthly take-home salary' : 'Average monthly income'}
          error={errors.monthlyIncome}
        >
          <input
            className="field-input"
            inputMode="numeric"
            placeholder="₹ 60,000"
            value={draft.monthlyIncome}
            aria-invalid={!!errors.monthlyIncome}
            onChange={(e) => onChange({ ...draft, monthlyIncome: formatRupeeInput(e.target.value) })}
          />
        </Field>
      </div>
      <div className="step-actions flex-col-reverse sm:flex-row">
        <Link href="/" className="btn btn-ghost w-full sm:w-auto">
          Back to home
        </Link>
        <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={next}>
          Continue
        </button>
      </div>
    </section>
  );
}
