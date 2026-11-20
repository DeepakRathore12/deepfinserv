'use client';

import { useState } from 'react';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError, postJson } from '@/lib/api';

/** Submits a form to the API and maps field errors from the server back onto the form. */
export function useApiSubmit<TValues extends FieldValues, TResult>(
  path: string,
  setError: UseFormSetError<TValues>,
) {
  const [result, setResult] = useState<TResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(values: TValues): Promise<TResult | null> {
    setFormError(null);
    try {
      const r = await postJson<TResult>(path, values);
      setResult(r);
      return r;
    } catch (e) {
      if (e instanceof ApiError) {
        for (const [k, m] of Object.entries(e.fields)) setError(k as Path<TValues>, { message: m });
        setFormError(e.message);
      } else setFormError('Something went wrong. Please try again.');
      return null;
    }
  }

  return { result, formError, submit, reset: () => setResult(null) };
}
