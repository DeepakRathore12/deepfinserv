'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, api } from '@/lib/api';

/** Fetch an admin endpoint; a 401 sends staff back to the sign-in page. */
export function useAdmin<T>(path: string | null) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!path) return;
    let live = true;
    api<T>(`/admin${path}`)
      .then((d) => live && (setData(d), setError(null)))
      .catch((e: unknown) => {
        if (!live) return;
        if (e instanceof ApiError && e.status === 401) router.replace('/admin/login');
        else setError(e instanceof ApiError ? e.message : 'Could not load this page');
      });
    return () => {
      live = false;
    };
  }, [path, version, router]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, reload };
}

export async function adminSend<T = unknown>(
  method: 'POST' | 'PATCH' | 'PUT',
  path: string,
  body: unknown,
): Promise<T> {
  return api<T>(`/admin${path}`, { method, body: JSON.stringify(body) });
}

/** Send a file as the raw request body; the API checks the type from the bytes. */
export async function adminUpload(path: string, file: File): Promise<void> {
  await api(`/admin${path}`, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
  });
}

export async function adminDelete(path: string): Promise<void> {
  await api(`/admin${path}`, { method: 'DELETE' });
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
export const when = (s: string) =>
  new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const label = (s: string) => s.replace(/[_-]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
