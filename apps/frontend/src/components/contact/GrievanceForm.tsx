'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { GRIEVANCE_CATEGORIES, grievanceSchema, type GrievanceInput } from '@dk/shared';
import { Field, FormAlert, Honeypot } from '../forms/Field';
import { digitsOnly } from '../forms/inputs';
import { SuccessCard } from './SuccessCard';
import { useApiSubmit } from './useApiForm';
import { track } from '@/lib/analytics';

type V = z.input<typeof grievanceSchema>;

export function GrievanceForm() {
  const { register, handleSubmit, formState, setError, setValue, getValues, reset } = useForm<V>({
    resolver: zodResolver(grievanceSchema),
    mode: 'onTouched',
    defaultValues: { category: GRIEVANCE_CATEGORIES[0] },
  });
  const api = useApiSubmit<V, { ticketNo: string }>('/grievances', setError);
  const e = formState.errors;

  const onSubmit = handleSubmit(async (v) => {
    if (await api.submit(v as GrievanceInput)) track('grievance_submitted');
  });

  if (api.result)
    return (
      <SuccessCard
        title="Grievance registered"
        actions={
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              reset();
              api.reset();
            }}
          >
            Raise another
          </button>
        }
      >
        Your ticket number is <strong className="text-ink">{api.result.ticketNo}</strong>. Our Grievance
        Officer will contact you on +91 {getValues('mobile')} within 24 hours.
      </SuccessCard>
    );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="a-up relative flex flex-col gap-[18px] rounded-[28px] bg-white p-5 sm:p-[clamp(22px,4vw,36px)]"
      aria-labelledby="gr-h"
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="gr-h" className="m-0 font-display text-[26px] font-extrabold tracking-[-0.6px]">
          Raise a grievance
        </h2>
        <p className="m-0 text-[15px] text-muted">
          We acknowledge every complaint within 24 hours and aim to resolve it within 7 working days.
        </p>
      </div>
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
        <Field
          className="flex-[1_1_220px]"
          label="Application reference (if any)"
          error={e.referenceNo?.message}
        >
          <input className="field-input uppercase" placeholder="DK26XXXXXXXX" {...register('referenceNo')} />
        </Field>
        <Field className="flex-[1_1_220px]" label="Issue type">
          <select className="field-input" {...register('category')}>
            {GRIEVANCE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Describe the issue" error={e.message?.message}>
        <textarea
          className="field-input min-h-[120px] resize-y leading-normal font-medium"
          placeholder="Tell us what happened, with dates if possible"
          aria-invalid={!!e.message}
          {...register('message')}
        />
      </Field>
      <Honeypot register={register('website')} />
      {api.formError ? <FormAlert>{api.formError}</FormAlert> : null}
      <button
        type="submit"
        className="btn btn-primary min-h-12 sm:min-h-[54px] w-full sm:w-auto self-start"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Submitting…' : 'Submit grievance'}
      </button>
    </form>
  );
}
