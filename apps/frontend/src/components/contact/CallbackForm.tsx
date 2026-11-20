'use client';

import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PRODUCT_LIST, callbackSchema, type CallbackInput } from '@dk/shared';
import { Field, FormAlert, Honeypot } from '../forms/Field';
import { digitsOnly } from '../forms/inputs';
import { SuccessCard } from './SuccessCard';
import { useApiSubmit } from './useApiForm';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import type { z } from 'zod';

type V = z.input<typeof callbackSchema>;
const SLOTS = [
  { v: 'morning', l: 'Morning' },
  { v: 'afternoon', l: 'Afternoon' },
  { v: 'evening', l: 'Evening' },
] as const;

export function CallbackForm() {
  const { register, handleSubmit, formState, setError, setValue, control, reset, getValues } = useForm<V>({
    resolver: zodResolver(callbackSchema),
    mode: 'onTouched',
    defaultValues: { product: 'personal-loan', slot: 'morning' },
  });
  const api = useApiSubmit<V, { id: string }>('/callbacks', setError);
  const e = formState.errors;
  const slot = useWatch({ control, name: 'slot' });

  const onSubmit = handleSubmit(async (v) => {
    const r = await api.submit(v as CallbackInput);
    if (r) track('callback_requested', { product: v.product ?? 'none' });
  });

  if (api.result) {
    const v = getValues();
    const productName = PRODUCT_LIST.find((p) => p.slug === v.product)?.name.toLowerCase() ?? 'loan';
    return (
      <SuccessCard
        title="Callback requested"
        actions={
          <>
            <Link href="/apply" className="btn btn-primary">
              Check my offers now
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                reset();
                api.reset();
              }}
            >
              Make another request
            </button>
          </>
        }
      >
        Thanks, {v.name.trim().split(' ')[0]}. A loan expert will call +91 {v.mobile} in the {v.slot} about
        your {productName}. You will get an SMS with their name.
      </SuccessCard>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="a-up relative flex flex-col gap-[18px] rounded-[28px] bg-white p-5 sm:p-[clamp(22px,4vw,36px)]"
      aria-labelledby="cb-h"
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="cb-h" className="m-0 font-display text-[26px] font-extrabold tracking-[-0.6px]">
          Request a callback
        </h2>
        <p className="m-0 text-[15px] text-muted">
          A loan expert calls you at the time you pick. Free, no obligation.
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
        <Field className="flex-[1_1_220px]" label="What do you need?">
          <select
            className="field-input"
            {...register('product', { setValueAs: (v) => (v === '' ? null : v) })}
          >
            {PRODUCT_LIST.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
            <option value="">Not sure yet</option>
          </select>
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
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 text-[13px] font-semibold text-muted">Best time to call</legend>
        <div className="flex flex-wrap gap-2">
          {SLOTS.map((s) => (
            <label
              key={s.v}
              className={cn(
                'inline-flex min-h-[46px] cursor-pointer items-center rounded-[14px] border-[1.5px] px-[18px] text-sm font-semibold',
                slot === s.v ? 'border-indigo bg-lilac text-navy' : 'border-line bg-white text-ink',
              )}
            >
              <input type="radio" value={s.v} className="sr-only" {...register('slot')} />
              {s.l}
            </label>
          ))}
        </div>
      </fieldset>
      <Honeypot register={register('website')} />
      {api.formError ? <FormAlert>{api.formError}</FormAlert> : null}
      <button
        type="submit"
        className="btn btn-primary min-h-12 sm:min-h-[54px] w-full sm:w-auto self-start"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Sending…' : 'Request my callback'}
      </button>
    </form>
  );
}
