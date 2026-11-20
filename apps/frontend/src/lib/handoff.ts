import type { ProductSlug } from '@dk/shared';

/**
 * Carries the hero matcher's answers into /apply without putting the mobile number in the URL,
 * where it would end up in server logs and analytics.
 */
export interface Handoff {
  product: ProductSlug;
  amount: number;
  mobile: string;
}

const KEY = 'dk-handoff';

export function saveHandoff(h: Handoff): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* private mode: the user retypes */
  }
}

export function takeHandoff(): Partial<Handoff> {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Handoff>) : {};
  } catch {
    return {};
  }
}
