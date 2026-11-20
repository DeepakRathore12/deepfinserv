'use client';

import { digitsOnly } from './inputs';

export function OtpInput({
  value,
  onChange,
  maskedMobile,
  error,
  cooldown,
  onResend,
  sending,
}: {
  value: string;
  onChange: (v: string) => void;
  maskedMobile: string;
  error?: string | null;
  cooldown: number;
  onResend: () => void;
  sending: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label className="field-label">
        Enter the 6-digit code sent to +91 {maskedMobile}
        <input
          className="field-input max-w-[300px] text-center text-[22px] sm:text-[26px] tracking-[8px] sm:tracking-[12px]"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={value}
          aria-invalid={!!error}
          autoFocus
          onChange={(e) => onChange(digitsOnly(e.target.value, 6))}
        />
        {error ? (
          <span className="field-error" role="alert">
            {error}
          </span>
        ) : null}
      </label>
      <p className="m-0 text-sm text-muted">
        Didn&apos;t get it?{' '}
        {cooldown > 0 ? (
          <span>Resend in {cooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={sending}
            className="cursor-pointer border-0 bg-transparent p-0 font-bold text-indigo"
          >
            Resend code
          </button>
        )}
      </p>
    </div>
  );
}

export const maskMobile = (m: string) => (m ? `XXXXXX${m.slice(-4)}` : '');
