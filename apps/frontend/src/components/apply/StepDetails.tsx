'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { applicationDetailsSchema, formatINR } from '@dk/shared';
import { Field, FormAlert } from '../forms/Field';
import { digitsOnly } from '../forms/inputs';
import type { OfferView } from './types';

export type DetailsValues = z.input<typeof applicationDetailsSchema>;

export function StepDetails({
  offer,
  salaried,
  onBack,
  onSubmit,
  error,
  fieldErrors,
}: {
  offer: OfferView;
  salaried: boolean;
  onBack: () => void;
  onSubmit: (v: DetailsValues) => Promise<void>;
  error: string | null;
  fieldErrors: Record<string, string>;
}) {
  const { register, handleSubmit, formState, setValue } = useForm<DetailsValues>({
    resolver: zodResolver(applicationDetailsSchema),
    mode: 'onTouched',
  });
  const e = formState.errors;
  const err = (k: keyof DetailsValues) => e[k]?.message ?? fieldErrors[k];
  const hasErrors = formState.submitCount > 0 && Object.keys(e).length > 0;

  return (
    <form className="card-step a-in" aria-labelledby="s4h" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-2">
        <h1 id="s4h" className="step-h1">
          Last step: your details
        </h1>
        <p className="step-sub">
          {offer.lenderName} needs these to process your application. Enter them exactly as on your PAN card.
        </p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-[18px] bg-card px-[18px] py-3.5 text-sm">
        <span>
          <span className="text-muted">Offer </span>
          <strong>{offer.lenderName}</strong>
        </span>
        <span>
          <span className="text-muted">APR </span>
          <strong>{offer.apr.toFixed(2)}%</strong>
        </span>
        <span>
          <span className="text-muted">EMI </span>
          <strong>{formatINR(offer.emi)}</strong>
        </span>
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer border-0 bg-transparent p-0 font-bold text-indigo underline"
        >
          Change offer
        </button>
      </div>
      {hasErrors ? <FormAlert>A few details need fixing. Check the fields marked in red.</FormAlert> : null}
      <div className="step-row">
        <Field label="Full name (as on PAN)" error={err('fullName')}>
          <input
            className="field-input"
            autoComplete="name"
            placeholder="Rohit Sharma"
            aria-invalid={!!err('fullName')}
            {...register('fullName')}
          />
        </Field>
        <Field label="Date of birth" error={err('dob')}>
          <input
            className="field-input"
            type="date"
            autoComplete="bday"
            aria-invalid={!!err('dob')}
            {...register('dob')}
          />
        </Field>
      </div>
      <div className="step-row">
        <Field label="PAN" error={err('pan')}>
          <input
            className="field-input uppercase"
            maxLength={10}
            placeholder="ABCDE1234F"
            aria-invalid={!!err('pan')}
            {...register('pan', {
              onChange: (ev) => setValue('pan', ev.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')),
            })}
          />
        </Field>
        <Field label="Email" error={err('email')}>
          <input
            className="field-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!err('email')}
            {...register('email')}
          />
        </Field>
      </div>
      <div className="step-row">
        <Field label={salaried ? 'Company you work for' : 'Business name'} error={err('employer')}>
          <input
            className="field-input"
            autoComplete="organization"
            placeholder={salaried ? 'Company name' : 'Your business'}
            aria-invalid={!!err('employer')}
            {...register('employer')}
          />
        </Field>
        <Field label="Pincode" error={err('pincode')}>
          <input
            className="field-input"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="452001"
            aria-invalid={!!err('pincode')}
            {...register('pincode', {
              onChange: (ev) => setValue('pincode', digitsOnly(ev.target.value, 6)),
            })}
          />
        </Field>
      </div>
      <Field label="City" error={err('city')}>
        <input
          className="field-input"
          autoComplete="address-level2"
          placeholder="Your city"
          aria-invalid={!!err('city')}
          {...register('city')}
        />
      </Field>
      <label className="flex items-start gap-3 rounded-[14px] bg-card p-3.5 text-[13.5px] leading-[1.55] text-muted">
        <input
          type="checkbox"
          className="mt-px h-5 w-5 flex-none accent-indigo"
          {...register('consentBureau')}
        />
        <span>
          I authorise {offer.lenderName} to fetch my credit report to process this application. See our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
          {err('consentBureau') ? (
            <span className="field-error mt-1 block">{err('consentBureau')}</span>
          ) : null}
        </span>
      </label>
      {error ? <FormAlert>{error}</FormAlert> : null}
      <div className="step-actions flex-col-reverse sm:flex-row">
        <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onBack}>
          Back to offers
        </button>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Submitting…' : 'Submit application'}
        </button>
      </div>
    </form>
  );
}
