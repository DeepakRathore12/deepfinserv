'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mobileSchema, panSchema, personNameSchema } from '@dk/shared';
import { Field, FormAlert } from '../forms/Field';
import { OtpInput, maskMobile } from '../forms/OtpInput';
import { digitsOnly } from '../forms/inputs';
import { ScoreGauge } from './ScoreGauge';
import { useOtp } from '@/lib/otp';
import { ApiError, postJson } from '@/lib/api';
import { track } from '@/lib/analytics';

const formSchema = z.object({
  fullName: personNameSchema,
  mobile: mobileSchema,
  pan: panSchema,
  consentBureau: z.literal(true, { message: 'Please give consent to continue' }),
});
type FormValues = z.input<typeof formSchema>;

export interface ScoreFactor {
  name: string;
  impact: string;
  value: string;
  pct: number;
  status: string;
  tone: 'good' | 'warn' | 'neutral';
}
export interface ScoreResult {
  status: 'ready' | 'advisor_review';
  reference: string;
  score?: number;
  band?: string;
  factors?: ScoreFactor[];
  tips?: string[];
}

const toneColor = { good: '#0B6E4C', warn: '#8A5400', neutral: '#2B3A9A' } as const;
const barColor = { good: '#0B6E4C', warn: '#F5A524', neutral: '#2B3A9A' } as const;

export function ScoreFlow() {
  const [stage, setStage] = useState<'form' | 'otp' | 'result'>('form');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const otp = useOtp('score');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), mode: 'onTouched' });
  const { register, handleSubmit, formState, getValues, setValue } = form;
  const e = formState.errors;

  const onForm = handleSubmit(async (v) => {
    if (await otp.send(v.mobile, { scoreRequest: { fullName: v.fullName, pan: v.pan } })) setStage('otp');
  });

  async function onVerify() {
    if (code.length !== 6) return;
    const token = await otp.verify(code);
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      /*
      // Commented out: Fetching credit score data from CIBIL / Experian
      const v = getValues();
      const r = await postJson<ScoreResult>('/credit-score/requests', {
        fullName: v.fullName,
        pan: v.pan,
        verificationToken: token,
        consentBureau: true,
      });
      track('score_requested', { status: r.status });
      setResult(r);
      setStage('result');
      */
      setError('Online credit score check is temporarily paused. Please explore our loan offers directly.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === 'result' && result) return <ScoreResultView r={result} name={getValues('fullName')} />;

  return (
    <div className="a-up d2 max-w-[500px] min-w-0 flex-[1_1_420px] rounded-[32px] bg-white/60 p-2">
      <div className="flex flex-col gap-4 rounded-[26px] bg-white p-7 text-center">
        <h2 className="m-0 font-display text-[23px] font-bold tracking-[-0.5px]">
          Credit Score Check Paused
        </h2>
        <p className="m-0 text-sm leading-relaxed text-muted">
          Online credit score report fetching (CIBIL / Experian) is temporarily disabled. You can still check and compare your loan offers directly without any impact on your credit score.
        </p>
        <Link href="/apply" className="btn btn-green min-h-[50px] text-base justify-center">
          Compare Loan Offers
        </Link>
      </div>
    </div>
  );

  /*
  // Commented out: Original Experian/CIBIL credit score form
  if (stage === 'otp') {
    return (
      <div className="a-in flex max-w-[500px] flex-col gap-5 rounded-[26px] bg-white p-7">
        <h2 className="m-0 font-display text-[23px] font-bold">Verify your number</h2>
        <OtpInput
          value={code}
          onChange={setCode}
          maskedMobile={maskMobile(getValues('mobile'))}
          error={otp.error}
          cooldown={otp.cooldown}
          sending={otp.sending}
          onResend={() => otp.send(getValues('mobile'))}
        />
        {error ? <FormAlert>{error}</FormAlert> : null}
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              otp.reset();
              setStage('form');
            }}
          >
            Change details
          </button>
          <button
            type="button"
            className="btn btn-green flex-1"
            disabled={code.length !== 6 || otp.verifying || submitting}
            onClick={onVerify}
          >
            {otp.verifying || submitting ? 'Checking…' : 'Verify and continue'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="a-up d2 max-w-[500px] min-w-0 flex-[1_1_420px] rounded-[32px] bg-white/60 p-2">
      <form
        onSubmit={onForm}
        noValidate
        className="flex flex-col gap-4 rounded-[26px] bg-white p-7"
        aria-labelledby="score-form-h"
      >
        <h2 id="score-form-h" className="m-0 font-display text-[23px] font-bold tracking-[-0.5px]">
          Get your free credit score
        </h2>
        <Field label="Full name (as on PAN)" error={e.fullName?.message}>
          <input
            className="field-input"
            autoComplete="name"
            placeholder="Rohit Sharma"
            aria-invalid={!!e.fullName}
            {...register('fullName')}
          />
        </Field>
        <div className="flex flex-wrap gap-3.5">
          <Field className="flex-[1_1_180px]" label="Mobile number" error={e.mobile?.message}>
            <input
              className="field-input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              aria-invalid={!!e.mobile}
              {...register('mobile', {
                onChange: (ev) => setValue('mobile', digitsOnly(ev.target.value, 10)),
              })}
            />
          </Field>
          <Field className="flex-[1_1_180px]" label="PAN" error={e.pan?.message}>
            <input
              className="field-input uppercase"
              maxLength={10}
              placeholder="ABCDE1234F"
              aria-invalid={!!e.pan}
              {...register('pan', {
                onChange: (ev) => setValue('pan', ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')),
              })}
            />
          </Field>
        </div>
        <label className="flex items-start gap-2.5 text-[12.5px] leading-[1.55] text-muted">
          <input
            type="checkbox"
            className="mt-px h-[18px] w-[18px] flex-none accent-green"
            {...register('consentBureau')}
          />
          <span>
            I authorise DeepFinServ to fetch my credit report from a credit bureau and agree to the{' '}
            <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
            {e.consentBureau ? (
              <span className="field-error mt-1 block">{e.consentBureau.message}</span>
            ) : null}
          </span>
        </label>
        {otp.error ? <FormAlert>{otp.error}</FormAlert> : null}
        <button type="submit" className="btn btn-green min-h-[54px] text-base" disabled={otp.sending}>
          {otp.sending ? 'Sending code…' : 'Get my free score'}
        </button>
        <span className="field-hint text-center">We will verify your number with a one-time password</span>
      </form>
    </div>
  );
  */
}

function ScoreResultView({ r, name }: { r: ScoreResult; name: string }) {
  const first = name.trim().split(' ')[0] ?? 'there';
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [shown, setShown] = useState(() => (reduced && r.score ? r.score : 300));
  useEffect(() => {
    if (r.status !== 'ready' || !r.score || reduced) return;
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      const k = 1 - (1 - Math.min(1, t / 40)) ** 3;
      setShown(Math.round(300 + (r.score! - 300) * k));
      if (t >= 40) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [r, reduced]);

  if (r.status !== 'ready' || !r.score) {
    return (
      <div className="a-up flex max-w-[560px] flex-col gap-4 rounded-[26px] bg-white p-7" role="status">
        <span className="a-pop flex h-14 w-14 items-center justify-center rounded-full bg-mint">
          <svg
            aria-hidden
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B6E4C"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="a-draw" pathLength={1} d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h2 className="m-0 font-display text-[26px] font-extrabold tracking-[-0.6px]">
          Thanks, {first}. Your request is in.
        </h2>
        <p className="m-0 text-base leading-relaxed text-muted">
          A loan expert will share your credit report and walk you through it within one working day. Your
          reference is <strong className="text-ink">{r.reference}</strong>.
        </p>
        <Link href="/apply" className="btn btn-primary self-start">
          See loan offers meanwhile
        </Link>
      </div>
    );
  }

  const band = r.band ?? '';
  const bandColor = r.score >= 750 ? '#0B6E4C' : r.score >= 650 ? '#2B3A9A' : '#8A5400';
  return (
    <div className="flex w-full flex-col gap-6">
      <h2 className="m-0 font-display text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-1px]">
        Hi {first}, here is your credit report
      </h2>
      <div className="flex flex-wrap gap-5">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col items-center gap-4 rounded-[28px] bg-white p-7">
          <ScoreGauge
            score={r.score}
            shown={shown}
            band={band}
            bandColor={bandColor}
            label={`Credit score ${r.score} out of 900, ${band}`}
          />
        </div>
        <ul className="facts m-0 grid min-w-0 flex-[2_1_560px] list-none grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3 p-0">
          {(r.factors ?? []).map((f) => (
            <li key={f.name} className="flex flex-col gap-2.5 rounded-[22px] bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-[15px]">{f.name}</strong>
                <span className="rounded-full bg-surface px-[9px] py-[3px] text-[11.5px] font-bold text-muted">
                  {f.impact}
                </span>
              </div>
              <span className="font-display text-[28px] font-extrabold tracking-[-0.8px]">{f.value}</span>
              <span className="flex h-1.5 rounded-full bg-[#EEF0F6]" aria-hidden>
                <span
                  className="a-grow block h-full rounded-full"
                  style={{ width: `${f.pct}%`, background: barColor[f.tone] }}
                />
              </span>
              <span className="text-[13px] font-semibold" style={{ color: toneColor[f.tone] }}>
                {f.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {r.tips?.length ? (
        <div className="flex flex-col gap-3.5 rounded-[28px] bg-white p-7">
          <h3 className="m-0 font-display text-[21px] font-bold">How to improve</h3>
          <ol className="m-0 flex flex-col gap-2.5 pl-5 text-[14.5px] leading-[1.55] text-[#3B4060]">
            {r.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-5 rounded-[28px] bg-navy p-[clamp(24px,4vw,36px)] text-white">
        <strong className="font-display text-[26px] tracking-[-0.6px]">
          See the loans you can get at a score of {r.score}
        </strong>
        <Link href="/apply" className="btn min-h-[54px] bg-marigold text-base text-ink hover:text-ink">
          See my offers
        </Link>
      </div>
    </div>
  );
}
