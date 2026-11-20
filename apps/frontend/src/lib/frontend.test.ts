import { describe, expect, it } from 'vitest';
import { PRODUCT_LIST } from '@dk/shared';
import { digitsOnly, formatRupeeInput, toRupees } from '@/components/forms/inputs';
import { breadcrumbLd, pageMetadata } from './seo';
import sitemap from '../app/sitemap';
import robots from '../app/robots';

describe('input masks', () => {
  it('keeps digits only, up to the limit', () =>
    expect(digitsOnly('98a76-54 3210 99', 10)).toBe('9876543210'));
  it('formats rupees the Indian way and parses them back', () => {
    expect(formatRupeeInput('1500000')).toBe('15,00,000');
    expect(toRupees('15,00,000')).toBe(1500000);
    expect(toRupees('')).toBe(0);
  });
});

describe('SEO', () => {
  it('gives every page a canonical URL and a title', () => {
    const m = pageMetadata({ title: 'Personal Loan', description: 'd', path: '/loans/personal-loan' });
    expect(m.alternates?.canonical).toContain('/loans/personal-loan');
    expect(String(m.title)).toContain('Personal Loan');
  });
  it('builds breadcrumbs with positions', () => {
    const b = breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Loans', path: '/loans' },
    ]);
    expect(b.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2]);
  });
  it('lists every product page in the sitemap and keeps private areas out', () => {
    const urls = sitemap().map((e) => e.url);
    for (const p of PRODUCT_LIST) expect(urls.some((u) => u.endsWith(`/loans/${p.slug}`))).toBe(true);
    expect(urls.some((u) => /\/(apply|admin)/.test(u))).toBe(false);
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(JSON.stringify(rules)).toContain('/admin');
  });
});
