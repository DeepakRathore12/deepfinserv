import type React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label wrapping its control, with an error or hint line under it, as in the design. */
export function Field({ label, error, hint, className, children }: FieldProps) {
  return (
    <label className={cn('field-label', className)}>
      {label}
      {children}
      {error ? (
        <span className="field-error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function FormAlert({
  children,
  tone = 'error',
}: {
  children: React.ReactNode;
  tone?: 'error' | 'success';
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-[14px] px-4 py-3 text-sm font-semibold',
        tone === 'error' ? 'bg-[#fff5f5] text-[#a31b1b]' : 'bg-mint text-green',
      )}
    >
      {children}
    </div>
  );
}

/** Hidden field bots fill and people never see. The API rejects submissions where it has a value. */
export function Honeypot({ register }: { register: React.InputHTMLAttributes<HTMLInputElement> }) {
  return (
    <input
      {...register}
      type="text"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  );
}
