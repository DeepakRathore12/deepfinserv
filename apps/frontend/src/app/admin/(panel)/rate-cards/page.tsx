'use client';

import { useState } from 'react';
import { PRODUCT_LIST, PRODUCTS, type ProductSlug } from '@dk/shared';
import { Loading, PageHead, Panel, Table } from '@/components/admin/ui';
import { adminSend, inr, useAdmin } from '@/components/admin/useAdmin';
import { ApiError } from '@/lib/api';

interface Card {
  id: string;
  lenderId: string;
  lenderName: string;
  product: ProductSlug;
  aprMin: number;
  aprMax: number;
  processingFeePct: number;
  minIncome: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  foirCap: number | null;
  kfsUrl: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  active: boolean;
}
type Form = Record<
  | 'lenderId'
  | 'product'
  | 'aprMin'
  | 'aprMax'
  | 'processingFeePct'
  | 'minIncome'
  | 'maxAmount'
  | 'minTenure'
  | 'maxTenure'
  | 'foirCap'
  | 'kfsUrl'
  | 'effectiveFrom'
  | 'effectiveTo',
  string
> & { active: boolean };

const today = () => new Date().toISOString().slice(0, 10);
const blank = (): Form => ({
  lenderId: '',
  product: 'personal-loan',
  aprMin: '',
  aprMax: '',
  processingFeePct: '',
  minIncome: '',
  maxAmount: '',
  minTenure: '',
  maxTenure: '',
  foirCap: '',
  kfsUrl: '',
  effectiveFrom: today(),
  effectiveTo: '',
  active: true,
});
const toForm = (c: Card): Form => ({
  lenderId: c.lenderId,
  product: c.product,
  aprMin: String(c.aprMin),
  aprMax: String(c.aprMax),
  processingFeePct: String(c.processingFeePct),
  minIncome: String(c.minIncome),
  maxAmount: String(c.maxAmount),
  minTenure: String(c.minTenure),
  maxTenure: String(c.maxTenure),
  foirCap: c.foirCap == null ? '' : String(c.foirCap),
  kfsUrl: c.kfsUrl ?? '',
  effectiveFrom: c.effectiveFrom,
  effectiveTo: c.effectiveTo ?? '',
  active: c.active,
});

const NUM: [keyof Form, string, string][] = [
  ['aprMin', 'APR from (%)', '0.01'],
  ['aprMax', 'APR up to (%)', '0.01'],
  ['processingFeePct', 'Processing fee (%)', '0.01'],
  ['minIncome', 'Minimum monthly income (₹)', '1000'],
  ['maxAmount', 'Maximum amount (₹)', '10000'],
  ['minTenure', 'Minimum tenure (months)', '1'],
  ['maxTenure', 'Maximum tenure (months)', '1'],
  ['foirCap', 'FOIR cap (0.1 to 0.9, blank = 0.5)', '0.05'],
];

export default function RateCards() {
  const cards = useAdmin<{ data: Card[] }>('/rate-cards');
  const lenders = useAdmin<{ data: { id: string; name: string }[] }>('/lenders');
  const [form, setForm] = useState<Form>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState<{ message: string; fields: Record<string, string> } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const n = (v: string) => Number(v);
    const body = {
      lenderId: form.lenderId,
      product: form.product,
      aprMin: n(form.aprMin),
      aprMax: n(form.aprMax),
      processingFeePct: n(form.processingFeePct),
      minIncome: n(form.minIncome),
      maxAmount: n(form.maxAmount),
      minTenure: n(form.minTenure),
      maxTenure: n(form.maxTenure),
      foirCap: form.foirCap ? n(form.foirCap) : null,
      kfsUrl: form.kfsUrl || null,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
      active: form.active,
    };
    try {
      if (editing) await adminSend('PUT', `/rate-cards/${editing}`, body);
      else await adminSend('POST', '/rate-cards', body);
      setForm(blank());
      setEditing(null);
      cards.reload();
    } catch (x) {
      setErr(
        x instanceof ApiError
          ? { message: x.message, fields: x.fields }
          : { message: 'Could not save', fields: {} },
      );
    }
  }

  return (
    <>
      <PageHead
        title="Rate cards"
        sub="Offers are calculated from active cards. Enter only the rates in your signed lender agreements, with the lender's KFS link."
      />
      {cards.error && <p className="field-error">{cards.error}</p>}
      {!cards.data && !cards.error && <Loading />}
      {cards.data && (
        <Table head={['Product', 'Lender', 'APR', 'Fee', 'Min income', 'Max amount', 'Tenure', 'Valid', '']}>
          {cards.data.data.map((c) => (
            <tr key={c.id} className={c.active ? '' : 'text-muted'}>
              <td className="px-4 py-3">{PRODUCTS[c.product]?.name}</td>
              <td className="px-4 py-3 font-semibold">{c.lenderName}</td>
              <td className="px-4 py-3 tabular-nums">
                {c.aprMin}% to {c.aprMax}%
              </td>
              <td className="px-4 py-3">{c.processingFeePct}%</td>
              <td className="px-4 py-3">{inr(c.minIncome)}</td>
              <td className="px-4 py-3">{inr(c.maxAmount)}</td>
              <td className="px-4 py-3">
                {c.minTenure} to {c.maxTenure} mo
              </td>
              <td className="px-4 py-3 text-xs">
                {c.effectiveFrom}
                {c.effectiveTo ? ` to ${c.effectiveTo}` : ' onwards'}
                {!c.active && ' (off)'}
                {!c.kfsUrl && <span className="block font-bold text-danger">No KFS link</span>}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  className="font-semibold text-indigo"
                  onClick={() => {
                    setEditing(c.id);
                    setForm(toForm(c));
                    window.scrollTo({ top: document.body.scrollHeight });
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <Panel className="mt-6 max-w-[760px]">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <h2 className="font-bold text-ink sm:col-span-2">
            {editing ? 'Edit rate card' : 'Add a rate card'}
          </h2>
          <div>
            <label className="field-label" htmlFor="rl">
              Lender
            </label>
            <select
              id="rl"
              required
              className="field-input"
              value={form.lenderId}
              onChange={(e) => setForm({ ...form, lenderId: e.target.value })}
            >
              <option value="">Choose a lender</option>
              {lenders.data?.data.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="rp">
              Product
            </label>
            <select
              id="rp"
              className="field-input"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
            >
              {PRODUCT_LIST.filter((p) => p.kind === 'loan').map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {NUM.map(([k, l, step]) => (
            <div key={k}>
              <label className="field-label" htmlFor={`r-${k}`}>
                {l}
              </label>
              <input
                id={`r-${k}`}
                type="number"
                step={step}
                min="0"
                required={k !== 'foirCap'}
                className="field-input"
                value={form[k] as string}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                aria-invalid={!!err?.fields[k]}
              />
              {err?.fields[k] && <p className="field-error">{err.fields[k]}</p>}
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="rk">
              Key Fact Statement link
            </label>
            <input
              id="rk"
              type="url"
              className="field-input"
              value={form.kfsUrl}
              onChange={(e) => setForm({ ...form, kfsUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="rf">
              Valid from
            </label>
            <input
              id="rf"
              type="date"
              required
              className="field-input"
              value={form.effectiveFrom}
              onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="rt">
              Valid until (blank = open)
            </label>
            <input
              id="rt"
              type="date"
              className="field-input"
              value={form.effectiveTo}
              onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{' '}
            Active
          </label>
          {err && (
            <p className="field-error sm:col-span-2" role="alert">
              {err.message}
            </p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-primary">{editing ? 'Save changes' : 'Add rate card'}</button>
            {editing && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditing(null);
                  setForm(blank());
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>
    </>
  );
}
