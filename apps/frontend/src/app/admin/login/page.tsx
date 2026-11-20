'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { ApiError, postJson } from '@/lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await postJson('/admin/auth/login', { email: f.get('email'), password: f.get('password') });
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in');
      setBusy(false);
    }
  }

  return (
    <main id="main" className="grid min-h-screen place-items-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[380px] rounded-2xl border border-hairline bg-white p-8"
      >
        <Logo size={36} />
        <h1 className="h-display mt-6 text-2xl text-ink">Staff sign in</h1>
        <p className="mt-1 text-sm text-muted">For DeepFinServ team members only.</p>
        <label className="field-label mt-6 block" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="field-input"
        />
        <label className="field-label mt-4 block" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field-input"
        />
        {error && (
          <p className="field-error mt-3" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-primary mt-6 w-full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
