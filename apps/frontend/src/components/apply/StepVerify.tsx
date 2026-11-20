'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { PRODUCTS, mobileSchema } from '@dk/shared';
import { Field, FormAlert } from '../forms/Field';
import { OtpInput, maskMobile } from '../forms/OtpInput';
import { digitsOnly, toRupees } from '../forms/inputs';
import { useOtp } from '@/lib/otp';
import type { LoanDraft } from './types';

export function StepVerify({
  mobile,
  onMobile,
  onBack,
  onVerified,
  draft,
  utm,
  busy,
  error,
}: {
  mobile: string;
  onMobile: (m: string) => void;
  onBack: () => void;
  onVerified: (verificationToken: string) => Promise<void>;
  draft: LoanDraft;
  utm?: Record<string, string>;
  busy: boolean;
  error: string | null;
}) {
  const otp = useOtp('apply');
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState('');
  const [tried, setTried] = useState(false);
  const mobileOk = mobileSchema.safeParse(mobile).success;

  async function send() {
    setTried(true);
    if (!mobileOk || !consent) return;
    const isCard = PRODUCTS[draft.product].kind === 'card';
    await otp.send(mobile, {
      loan: {
        product: draft.product,
        amount: toRupees(draft.amount),
        tenureMonths: isCard ? 0 : draft.tenureMonths,
        employment: draft.employment,
        monthlyIncome: toRupees(draft.monthlyIncome),
      },
      utm,
    });
  }

  async function verify() {
    const token = await otp.verify(code);
    if (token) await onVerified(token);
  }

  return (
    <section className="card-step a-in max-w-[620px]" aria-labelledby="s2h">
      <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-lilac">
        <Smartphone size={28} strokeWidth={1.6} className="text-indigo" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 id="s2h" className="step-h1">
          Where should we send your offers?
        </h1>
        <p className="step-sub">
          We verify your number once so offers stay yours. No spam, no sharing without your consent.
        </p>
      </div>
      <Field
        label="Mobile number"
        error={tried && !mobileOk ? 'Enter a valid 10-digit mobile number' : undefined}
      >
        <span className="flex gap-2">
          <span className="field-input flex w-auto flex-none items-center text-muted">+91</span>
          <input
            className="field-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            placeholder="98765 43210"
            value={mobile}
            disabled={otp.sent}
            aria-invalid={tried && !mobileOk}
            onChange={(e) => onMobile(digitsOnly(e.target.value, 10))}
          />
        </span>
      </Field>
      <label className="flex items-start gap-3 rounded-[14px] bg-card p-3.5 text-[13.5px] leading-[1.55] text-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={otp.sent}
          className="mt-px h-5 w-5 flex-none accent-indigo"
        />
        <span>
          I agree that DeepFinServ and its lending partners may contact me by call, SMS, email or WhatsApp
          about my request, and I accept the <Link href="/terms">Terms</Link> and{' '}
          <Link href="/privacy">Privacy Policy</Link>.
          {tried && !consent ? (
            <span className="field-error mt-1 block">Tick this box to continue</span>
          ) : null}
        </span>
      </label>
      {otp.sent ? (
        <>
          <OtpInput
            value={code}
            onChange={setCode}
            maskedMobile={maskMobile(mobile)}
            error={otp.error}
            cooldown={otp.cooldown}
            sending={otp.sending}
            onResend={() => otp.send(mobile)}
          />
          <button
            type="button"
            onClick={otp.reset}
            className="cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-bold text-indigo underline"
          >
            Change number
          </button>
        </>
      ) : otp.error ? (
        <FormAlert>{otp.error}</FormAlert>
      ) : null}
      {error ? <FormAlert>{error}</FormAlert> : null}
      <div className="step-actions flex-col-reverse sm:flex-row">
        <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onBack}>
          Back
        </button>
        {otp.sent ? (
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            disabled={code.length !== 6 || otp.verifying || busy}
            onClick={verify}
          >
            {otp.verifying || busy ? 'Finding offers…' : 'Verify and see offers'}
          </button>
        ) : (
          <button type="button" className="btn btn-primary w-full sm:w-auto" disabled={otp.sending} onClick={send}>
            {otp.sending ? 'Sending…' : 'Send code'}
          </button>
        )}
      </div>
    </section>
  );
}
