'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LENDER_TYPES, LENDER_TYPE_LABEL, type LenderType } from '@dk/shared';
import { Loading, PageHead, Panel, Table } from '@/components/admin/ui';
import { adminDelete, adminSend, adminUpload, useAdmin } from '@/components/admin/useAdmin';
import { ApiError, browserApiUrl } from '@/lib/api';

interface Lender {
  id: string;
  name: string;
  lenderType: LenderType;
  regulator: string;
  website: string | null;
  grievanceContact: string | null;
  isSample: boolean;
  active: boolean;
  showOnHome: boolean;
  displayOrder: number;
  logoPath: string | null;
}
const blank = {
  name: '',
  lenderType: 'private_bank' as LenderType,
  regulator: 'RBI',
  website: '',
  grievanceContact: '',
  active: true,
  showOnHome: true,
  displayOrder: 100,
};
const LOGO_MAX_BYTES = 200 * 1024;
const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp';

export default function Lenders() {
  const { data, error, reload } = useAdmin<{ data: Lender[] }>('/lenders');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [err, setErr] = useState<{ message: string; fields: Record<string, string> } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const preview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile]);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = data?.data.find((l) => l.id === editing) ?? null;

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  function resetForm() {
    setForm(blank);
    setEditing(null);
    setLogoFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function pickLogo(file: File | undefined) {
    setErr(null);
    if (!file) return setLogoFile(null);
    if (!LOGO_ACCEPT.split(',').includes(file.type)) {
      setErr({ message: 'Logo must be a PNG, JPEG or WebP image', fields: {} });
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setErr({ message: 'Logo must be 200 KB or smaller', fields: {} });
      return;
    }
    setLogoFile(file);
  }

  async function removeLogo() {
    if (!editing) return;
    setErr(null);
    try {
      await adminDelete(`/lenders/${editing}/logo`);
      reload();
    } catch (x) {
      setErr({ message: x instanceof ApiError ? x.message : 'Could not remove the logo', fields: {} });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const body = { ...form, website: form.website || null, grievanceContact: form.grievanceContact || null };
    try {
      let id = editing;
      if (id) await adminSend('PUT', `/lenders/${id}`, body);
      else id = (await adminSend<{ id: string }>('POST', '/lenders', body)).id;
      if (logoFile) await adminUpload(`/lenders/${id}/logo`, logoFile);
      resetForm();
      reload();
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
        title="Lenders"
        sub="These appear on the public Lending partners page. Only add lenders DeepFinServ has a signed agreement with."
      />
      {error && <p className="field-error">{error}</p>}
      {!data && !error && <Loading />}
      {data && (
        <Table head={['Logo', 'Name', 'Type', 'Grievance contact', 'Status', 'Home page', '']}>
          {data.data.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3">
                {l.logoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={browserApiUrl(l.logoPath)}
                    alt={`${l.name} logo`}
                    className="h-8 w-20 object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted">None</span>
                )}
              </td>
              <td className="px-4 py-3 font-semibold">
                {l.name}
                {l.isSample && (
                  <span className="ml-2 text-xs font-bold text-danger">sample, hidden in production</span>
                )}
              </td>
              <td className="px-4 py-3">{LENDER_TYPE_LABEL[l.lenderType]}</td>
              <td className="px-4 py-3 text-muted">{l.grievanceContact ?? '—'}</td>
              <td className="px-4 py-3">{l.active ? 'Active' : 'Inactive'}</td>
              <td className="px-4 py-3">{l.showOnHome ? `Shown (order ${l.displayOrder})` : 'Hidden'}</td>
              <td className="px-4 py-3 text-right">
                <button
                  className="font-semibold text-indigo"
                  onClick={() => {
                    setEditing(l.id);
                    setLogoFile(null);
                    if (fileRef.current) fileRef.current.value = '';
                    setForm({
                      name: l.name,
                      lenderType: l.lenderType,
                      regulator: l.regulator,
                      website: l.website ?? '',
                      grievanceContact: l.grievanceContact ?? '',
                      active: l.active,
                      showOnHome: l.showOnHome,
                      displayOrder: l.displayOrder,
                    });
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <Panel className="mt-6 max-w-[640px]">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <h2 className="font-bold text-ink sm:col-span-2">{editing ? 'Edit lender' : 'Add a lender'}</h2>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="ln">
              Legal name
            </label>
            <input
              id="ln"
              className="field-input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              aria-invalid={!!err?.fields.name}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="lt">
              Type
            </label>
            <select
              id="lt"
              className="field-input"
              value={form.lenderType}
              onChange={(e) => setForm({ ...form, lenderType: e.target.value as LenderType })}
            >
              {LENDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LENDER_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="lr">
              Regulator
            </label>
            <input
              id="lr"
              className="field-input"
              value={form.regulator}
              onChange={(e) => setForm({ ...form, regulator: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="lw">
              Website
            </label>
            <input
              id="lw"
              type="url"
              className="field-input"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              aria-invalid={!!err?.fields.website}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="lg">
              Grievance officer contact
            </label>
            <input
              id="lg"
              className="field-input"
              value={form.grievanceContact}
              onChange={(e) => setForm({ ...form, grievanceContact: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="llogo">
              Logo
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {preview || current?.logoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview ?? browserApiUrl(current!.logoPath!)}
                  alt="Logo preview"
                  className="h-12 w-32 rounded-lg border border-line bg-white object-contain p-1"
                />
              ) : null}
              <input
                id="llogo"
                ref={fileRef}
                type="file"
                accept={LOGO_ACCEPT}
                className="text-sm"
                onChange={(e) => pickLogo(e.target.files?.[0])}
              />
              {current?.logoPath && !logoFile ? (
                <button type="button" className="text-sm font-semibold text-danger" onClick={removeLogo}>
                  Remove logo
                </button>
              ) : null}
            </div>
            <p className="field-hint mt-1">
              PNG, JPEG or WebP, up to 200 KB. A wide logo on a transparent background looks best. Use only
              with the lender&apos;s written permission.
            </p>
          </div>
          <div>
            <label className="field-label" htmlFor="lo">
              Home page order
            </label>
            <input
              id="lo"
              type="number"
              min={0}
              max={9999}
              className="field-input"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 0 })}
              aria-invalid={!!err?.fields.displayOrder}
            />
          </div>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.showOnHome}
                onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
              />
              Show on home page
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
          </div>
          {err && (
            <p className="field-error sm:col-span-2" role="alert">
              {err.message}
              {Object.values(err.fields).length > 0 && `: ${Object.values(err.fields).join(', ')}`}
            </p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn btn-primary">{editing ? 'Save changes' : 'Add lender'}</button>
            {editing && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>
    </>
  );
}
