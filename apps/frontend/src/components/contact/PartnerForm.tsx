'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { PARTNER_EXPERIENCE, PARTNER_PROFESSIONS, partnerSchema, type PartnerInput } from '@dk/shared';
import { Field, FormAlert, Honeypot } from '../forms/Field';
import { digitsOnly } from '../forms/inputs';
import { SuccessCard } from './SuccessCard';
import { useApiSubmit } from './useApiForm';
import { track } from '@/lib/analytics';

type V = z.input<typeof partnerSchema>;

const PERKS = [
  { v: 'Every disbursal', k: 'Earns you a payout', bg: 'bg-cream', c: 'text-[#4A3D1A]' },
  { v: '9 products', k: 'Banks and NBFCs for your clients', bg: 'bg-lilac', c: 'text-[#3B4060]' },
  { v: 'Weekly', k: 'Payout cycle', bg: 'bg-mint', c: 'text-[#1F3D31]' },
];

export function PartnerForm() {
  const { register, handleSubmit, formState, setError, setValue, getValues, reset } = useForm<V>({
    resolver: zodResolver(partnerSchema),
    mode: 'onTouched',
    defaultValues: { profession: PARTNER_PROFESSIONS[0], experience: PARTNER_EXPERIENCE[0] },
  });
  const api = useApiSubmit<V, { id: string }>('/partners', setError);
  const e = formState.errors;

  const onSubmit = handleSubmit(async (v) => {
    if (await api.submit(v as PartnerInput)) track('partner_applied');
  });

  if (api.result)
    return (
      <SuccessCard
        title="Partner application received"
        actions={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              reset();
              api.reset();
            }}
          >
            Back to form
          </button>
        }
      >
        Our partnerships team will call you within 2 working days to complete onboarding and KYC. We have
        emailed the partner agreement to {getValues('email')}.
      </SuccessCard>
    );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="a-up relative flex flex-col gap-[18px] rounded-[28px] bg-white p-5 sm:p-[clamp(22px,4vw,36px)]"
      aria-labelledby="pa-h"
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="pa-h" className="m-0 font-display text-[26px] font-extrabold tracking-[-0.6px]">
          Become a DeepFinServ partner
        </h2>
        <p className="m-0 text-[15px] text-muted">
          Refer loan customers and earn a payout on every disbursal. Free to join.
        </p>
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5 p-0">
        {PERKS.map((p) => (
          <li key={p.v} className={`flex flex-col gap-1 rounded-[18px] p-4 ${p.bg}`}>
            <strong className="font-display text-[22px]">{p.v}</strong>
            <span className={`text-[13px] ${p.c}`}>{p.k}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3.5">
        <Field className="flex-[1_1_220px]" label="Full name" error={e.name?.message}>
          <input
            className="field-input"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!e.name}
            {...register('name')}
          />
        </Field>
        <Field className="flex-[1_1_220px]" label="Mobile number" error={e.mobile?.message}>
          <input
            className="field-input"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
            aria-invalid={!!e.mobile}
            {...register('mobile', { onChange: (ev) => setValue('mobile', digitsOnly(ev.target.value, 10)) })}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3.5">
        <Field className="flex-[1_1_220px]" label="Email" error={e.email?.message}>
          <input
            className="field-input"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!e.email}
            {...register('email')}
          />
        </Field>
        <Field className="flex-[1_1_220px]" label="City" error={e.city?.message}>
          <input
            className="field-input"
            autoComplete="address-level2"
            placeholder="Your city"
            aria-invalid={!!e.city}
            {...register('city')}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3.5">
        <Field className="flex-[1_1_220px]" label="You are a">
          <select className="field-input" {...register('profession')}>
            {PARTNER_PROFESSIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field className="flex-[1_1_220px]" label="Experience in loans">
          <select className="field-input" {...register('experience')}>
            {PARTNER_EXPERIENCE.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Field>
      </div>
      <Honeypot register={register('website')} />
      {api.formError ? <FormAlert>{api.formError}</FormAlert> : null}
      <button
        type="submit"
        className="btn btn-primary min-h-12 sm:min-h-[54px] w-full sm:w-auto self-start"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Sending…' : 'Apply to partner'}
      </button>
    </form>
  );
}
