import type { ApiErrorBody } from '@dk/shared';

/** Error thrown for any non-2xx API response, carrying field-level messages when the API sends them. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

const serverBase = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';
const browserBase = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export function apiBase(): string {
  return typeof window === 'undefined' ? serverBase : browserBase;
}

/** URL the browser should load an API asset from, such as a lender logo, even when rendered on the server. */
export const browserApiUrl = (path: string): string => `${browserBase}${path}`;

export async function api<T>(
  path: string,
  init: RequestInit & { token?: string; next?: { revalidate?: number | false; tags?: string[] } } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(0, 'network', 'We could not reach our servers. Check your connection and try again.');
  }
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  if (!res.ok) {
    const e = (body as ApiErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      e?.code ?? 'error',
      e?.message ?? 'Something went wrong. Please try again.',
      e?.fields,
    );
  }
  return body as T;
}

export const postJson = <T>(path: string, data: unknown, token?: string) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(data), token });
