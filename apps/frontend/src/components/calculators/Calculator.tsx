'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  balanceTransfer,
  eligibleAmount,
  emi,
  formatINR,
  prepayment,
  tenureLabel,
  yearlySchedule,
  type CalculatorSlug,
} from '@dk/shared';

type Kind = 'money' | 'pct' | 'months';
interface FieldDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  kind: Kind;
}

const short = (n: number) => (n >= 1e7 ? `₹${n / 1e7} Cr` : n >= 1e5 ? `₹${n / 1e5} L` : formatINR(n));
const fmt = (v: number, k: Kind) => (k === 'money' ? short(v) : k === 'months' ? tenureLabel(v) : `${v}%`);

const DEFS: Record<
  CalculatorSlug,
  { title: string; desc: string; fields: FieldDef[]; init: Record<string, number> }
> = {
  emi: {
    title: 'EMI calculator',
    desc: 'See your monthly instalment for any loan amount, rate and tenure.',
    fields: [
      { key: 'p', label: 'Loan amount', min: 10000, max: 50000000, step: 10000, kind: 'money' },
      { key: 'r', label: 'Interest rate', min: 6, max: 30, step: 0.05, kind: 'pct' },
      { key: 'n', label: 'Tenure (months)', min: 6, max: 360, step: 6, kind: 'months' },
    ],
    init: { p: 500000, r: 10.5, n: 36 },
  },
  eligibility: {
    title: 'Eligibility calculator',
    desc: 'Lenders usually let total EMIs go up to about half of your monthly income.',
    fields: [
      { key: 'inc', label: 'Monthly income', min: 10000, max: 1000000, step: 1000, kind: 'money' },
      { key: 'ex', label: 'Current EMIs', min: 0, max: 500000, step: 500, kind: 'money' },
      { key: 'r', label: 'Interest rate', min: 6, max: 30, step: 0.05, kind: 'pct' },
      { key: 'n', label: 'Tenure (months)', min: 12, max: 360, step: 6, kind: 'months' },
    ],
    init: { inc: 60000, ex: 5000, r: 10.5, n: 60 },
  },
  'balance-transfer': {
    title: 'Balance transfer savings',
    desc: 'Compare your current loan with a lower rate after fees.',
    fields: [
      { key: 'o', label: 'Outstanding amount', min: 100000, max: 50000000, step: 50000, kind: 'money' },
      { key: 'cur', label: 'Current rate', min: 6, max: 30, step: 0.05, kind: 'pct' },
      { key: 'nw', label: 'New rate', min: 6, max: 30, step: 0.05, kind: 'pct' },
      { key: 'n', label: 'Remaining tenure (months)', min: 12, max: 360, step: 6, kind: 'months' },
      { key: 'fee', label: 'Transfer fee', min: 0, max: 3, step: 0.05, kind: 'pct' },
    ],
    init: { o: 2500000, cur: 9.5, nw: 8.5, n: 180, fee: 0.5 },
  },
  prepayment: {
    title: 'Prepayment calculator',
    desc: 'See how a part payment shortens your loan when you keep the same EMI.',
    fields: [
      { key: 'o', label: 'Outstanding amount', min: 100000, max: 50000000, step: 50000, kind: 'money' },
      { key: 'r', label: 'Interest rate', min: 6, max: 30, step: 0.05, kind: 'pct' },
      { key: 'n', label: 'Remaining tenure (months)', min: 12, max: 360, step: 6, kind: 'months' },
      { key: 'amt', label: 'Prepayment amount', min: 0, max: 10000000, step: 10000, kind: 'money' },
    ],
    init: { o: 2000000, r: 9, n: 180, amt: 200000 },
  },
};

interface Result {
  headK: string;
  headV: string;
  note?: { text: string; good: boolean };
  bar?: number;
  rows: { k: string; v: string }[];
  cta: { label: string; href: string };
  foot: string;
}

function compute(tool: CalculatorSlug, v: Record<string, number>): Result {
  const g = (k: string) => v[k] ?? 0;
  switch (tool) {
    case 'emi': {
      const pay = emi(g('p'), g('r'), g('n'));
      const total = pay * g('n');
      return {
        headK: 'Monthly EMI',
        headV: formatINR(pay),
        bar: total ? (g('p') / total) * 100 : 0,
        rows: [
          { k: 'Principal', v: formatINR(g('p')) },
          { k: 'Total interest', v: formatINR(total - g('p')) },
          { k: 'Total payable', v: formatINR(total) },
        ],
        cta: { label: 'Find lenders at this EMI', href: '/apply' },
        foot: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r is the monthly rate. Actual EMIs depend on the lender and may differ slightly due to rounding.',
      };
    }
    case 'eligibility': {
      const e = eligibleAmount(g('inc'), g('ex'), g('r'), g('n'));
      return {
        headK: 'You could borrow up to',
        headV: formatINR(e.amount),
        note:
          e.affordableEmi <= 0
            ? {
                text: 'Your current EMIs already use half your income. Closing a loan or adding a co-applicant can help.',
                good: false,
              }
            : undefined,
        rows: [
          { k: 'EMI you can afford', v: formatINR(e.affordableEmi) },
          { k: 'Income used for EMIs', v: '50%' },
          { k: 'Tenure', v: tenureLabel(g('n')) },
        ],
        cta: { label: 'Check my real eligibility', href: '/apply' },
        foot: 'Estimate uses a 50% fixed obligation to income ratio. Each lender has its own policy, and your CIBIL score, job and city also matter.',
      };
    }
    case 'balance-transfer': {
      const b = balanceTransfer(g('o'), g('cur'), g('nw'), g('n'), g('fee'));
      return {
        headK: b.worthIt ? 'You save in total' : 'Not worth switching',
        headV: formatINR(b.netSaving),
        note: b.worthIt
          ? { text: 'Worth considering. You save after paying the transfer fee.', good: true }
          : { text: 'The fee cancels out the saving at this rate gap.', good: false },
        rows: [
          { k: 'Current EMI', v: formatINR(b.currentEmi) },
          { k: 'New EMI', v: formatINR(b.newEmi) },
          { k: 'Monthly saving', v: formatINR(b.monthlySaving) },
          { k: 'Transfer fee', v: formatINR(b.fee) },
        ],
        cta: { label: 'Get a lower rate', href: '/apply?product=balance-transfer' },
        foot: 'Total saving = (current EMI − new EMI) × remaining months − transfer fee. Floating rate home loans for individuals have no foreclosure charges.',
      };
    }
    case 'prepayment': {
      const r = prepayment(g('o'), g('r'), g('n'), g('amt'));
      return {
        headK: 'Interest you save',
        headV: formatINR(r.interestSaved),
        rows: [
          { k: 'Loan closes earlier by', v: tenureLabel(r.monthsSaved) },
          { k: 'New tenure', v: tenureLabel(r.newMonths) },
          { k: 'EMI stays at', v: formatINR(r.emi) },
        ],
        cta: { label: 'Talk to an expert', href: '/contact' },
        foot: 'Assumes the EMI stays the same and the tenure reduces. Check prepayment charges with your lender before paying.',
      };
    }
  }
}

export function Calculator({ tool }: { tool: CalculatorSlug }) {
  const def = DEFS[tool];
  const [vals, setVals] = useState<Record<string, number>>(def.init);
  const set = (f: FieldDef, raw: string) => {
    const x = Number(raw);
    if (Number.isNaN(x)) return;
    setVals((s) => ({ ...s, [f.key]: Math.min(f.max, Math.max(f.min, x)) }));
  };
  const res = compute(tool, vals);
  const schedule = tool === 'emi' ? yearlySchedule(vals.p ?? 0, vals.r ?? 0, vals.n ?? 0) : [];

  return (
    <>
      <div className="a-up d2 flex flex-wrap overflow-hidden rounded-[28px] sm:rounded-[32px] bg-white">
        <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-6 sm:gap-[30px] p-5 sm:p-[clamp(24px,4vw,44px)]">
          <div className="flex flex-col gap-1.5">
            <h2 className="m-0 font-display text-xl sm:text-[26px] font-extrabold tracking-[-0.6px]">{def.title}</h2>
            <p className="m-0 text-sm sm:text-[15px] leading-[1.55] text-muted">{def.desc}</p>
          </div>
          {def.fields.map((f) => {
            const v = vals[f.key] ?? f.min;
            const id = `f-${f.key}`;
            return (
              <div key={f.key} className="flex flex-col gap-2 sm:gap-2.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={id} className="text-xs sm:text-[14.5px] font-semibold text-muted">
                    {f.label}
                  </label>
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm text-muted">
                    {f.kind === 'money' ? '₹' : null}
                    <input
                      id={id}
                      type="number"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={v}
                      onChange={(e) => set(f, e.target.value)}
                      className="w-[110px] sm:w-[130px] rounded-[10px] border-[1.5px] border-transparent bg-surface px-2 sm:px-2.5 py-1 sm:py-1.5 text-right text-sm sm:text-[15px] font-bold text-ink outline-none focus:border-indigo focus:bg-white"
                    />
                    {f.kind === 'pct' ? '%' : null}
                  </span>
                </div>
                <input
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={v}
                  aria-label={`${f.label} slider`}
                  aria-valuetext={fmt(v, f.kind)}
                  onChange={(e) => set(f, e.target.value)}
                />
                <span className="flex justify-between text-xs text-subtle" aria-hidden>
                  <span>{fmt(f.min, f.kind)}</span>
                  <span>{fmt(f.max, f.kind)}</span>
                </span>
              </div>
            );
          })}
        </div>
        <div
          className="flex min-w-0 flex-[1_1_360px] flex-col justify-center gap-5 sm:gap-[22px] bg-navy p-5 sm:p-[clamp(24px,4vw,44px)] text-white"
          aria-live="polite"
        >
          <span className="flex flex-col gap-1.5">
            <span className="text-sm text-on-navy">{res.headK}</span>
            <strong className="font-display text-[clamp(28px,5vw,56px)] leading-none tracking-[-1.5px] sm:tracking-[-2px]">
              {res.headV}
            </strong>
          </span>
          {res.note ? (
            <span
              className={`text-sm leading-[1.55] font-semibold ${res.note.good ? 'text-[#7EDDB5]' : 'text-[#FFE2A8]'}`}
            >
              {res.note.text}
            </span>
          ) : null}
          {res.bar != null ? (
            <span className="flex h-2.5 overflow-hidden rounded-full bg-marigold" aria-hidden>
              <span
                className="block h-full bg-white transition-[width] duration-500"
                style={{ width: `${res.bar}%` }}
              />
            </span>
          ) : null}
          <dl className="m-0 flex flex-col gap-3 text-[15px]">
            {res.rows.map((r) => (
              <div key={r.k} className="flex justify-between gap-3 border-b border-white/12 pb-3">
                <dt className="text-on-navy">{r.k}</dt>
                <dd className="m-0 font-bold">{r.v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={res.cta.href}
            className="btn min-h-[54px] bg-marigold text-base text-ink hover:text-ink"
          >
            {res.cta.label}
          </Link>
        </div>
      </div>
      {schedule.length ? (
        <div className="flex flex-col gap-3.5 rounded-[28px] bg-white p-4 sm:p-[clamp(22px,3.5vw,36px)]">
          <h3 className="m-0 font-display text-[21px] font-extrabold">Year-by-year repayment</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[14.5px]">
              <thead>
                <tr className="text-left text-[13px] text-muted">
                  <th className="px-2 py-2.5 font-semibold">Year</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Principal paid</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Interest paid</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Balance left</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((y) => (
                  <tr key={y.year} className="border-t border-[#EEF0F6]">
                    <td className="px-2 py-3 font-semibold">Year {y.year}</td>
                    <td className="px-2 py-3 text-right">{formatINR(y.principalPaid)}</td>
                    <td className="px-2 py-3 text-right">{formatINR(y.interestPaid)}</td>
                    <td className="px-2 py-3 text-right">{formatINR(y.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <p className="m-0 max-w-[760px] text-[13px] leading-relaxed text-subtle">{res.foot}</p>
    </>
  );
}
