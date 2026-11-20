'use client';

import Link from 'next/link';
import { useState } from 'react';
import { emi, formatINR, tenureLabel } from '@dk/shared';

/** Home page EMI calculator: three sliders and a result panel. */
export function EmiCard() {
  const [amt, setAmt] = useState(500000);
  const [rate, setRate] = useState(11);
  const [tenure, setTenure] = useState(36);
  const pay = emi(amt, rate, tenure);
  const total = pay * tenure;
  const pct = total ? Math.min(100, (amt / total) * 100) : 0;

  return (
    <div id="emi" className="flex min-w-0 flex-[2_1_560px] flex-wrap overflow-hidden rounded-[32px] bg-white">
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5 sm:gap-7 p-5 sm:p-[clamp(24px,3.5vw,36px)]">
        <h3 className="m-0 font-display text-[22px] font-bold tracking-[-0.4px]">EMI calculator</h3>
        <Slider
          label="Loan amount"
          value={formatINR(amt)}
          min={50000}
          max={5000000}
          step={50000}
          v={amt}
          set={setAmt}
        />
        <Slider
          label="Interest rate"
          value={`${rate.toFixed(2)}% p.a.`}
          min={7}
          max={24}
          step={0.25}
          v={rate}
          set={setRate}
        />
        <Slider
          label="Tenure"
          value={tenureLabel(tenure)}
          min={6}
          max={360}
          step={6}
          v={tenure}
          set={setTenure}
        />
      </div>
      <div
        className="flex min-w-0 flex-[1_1_260px] flex-col justify-center gap-[22px] bg-indigo p-5 sm:p-[clamp(24px,3.5vw,36px)] text-white"
        aria-live="polite"
      >
        <span className="flex flex-col gap-1.5">
          <span className="text-sm text-on-navy">Monthly EMI</span>
          <span className="font-display text-[clamp(32px,5.5vw,50px)] leading-none font-extrabold tracking-[-1.5px] sm:tracking-[-2px]">
            {formatINR(pay)}
          </span>
        </span>
        <span className="flex h-2.5 overflow-hidden rounded-full bg-marigold" aria-hidden>
          <span
            className="block h-full bg-white transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </span>
        <dl className="m-0 flex flex-col gap-2.5 text-[14.5px]">
          <Row k="Principal" v={formatINR(amt)} dot="#FFFFFF" />
          <Row k="Interest" v={formatINR(total - amt)} dot="#F5A524" />
          <div className="flex justify-between border-t border-white/20 pt-2.5">
            <dt className="text-on-navy-soft">Total payable</dt>
            <dd className="m-0 font-bold">{formatINR(total)}</dd>
          </div>
        </dl>
        <Link
          href="/apply"
          className="flex min-h-[50px] items-center justify-center rounded-full bg-white text-[15px] font-bold text-indigo no-underline"
        >
          Find lenders at this EMI
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v, dot }: { k: string; v: string; dot: string }) {
  return (
    <div className="flex justify-between">
      <dt className="flex items-center gap-2 text-on-navy-soft">
        <span aria-hidden className="h-[9px] w-[9px] rounded-full" style={{ background: dot }} />
        {k}
      </dt>
      <dd className="m-0 font-bold">{v}</dd>
    </div>
  );
}

function Slider(props: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  v: number;
  set: (n: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-muted">{props.label}</span>
        <span className="text-[17px] font-bold">{props.value}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.v}
        aria-valuetext={props.value}
        onChange={(e) => props.set(Number(e.target.value))}
      />
    </label>
  );
}
