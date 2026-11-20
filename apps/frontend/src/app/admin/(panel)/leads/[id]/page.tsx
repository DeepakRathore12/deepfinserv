'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { PRODUCTS, type ProductSlug } from '@dk/shared';
import { Loading, PageHead, Panel, Status } from '@/components/admin/ui';
import { adminSend, inr, label, useAdmin, when } from '@/components/admin/useAdmin';
import { LEAD_STATUSES } from '@/components/admin/statuses';
import { ApiError } from '@/lib/api';

interface Detail {
  lead: {
    id: string;
    product: ProductSlug;
    amount: number;
    tenureMonths: number;
    employment: string;
    monthlyIncome: number;
    status: string;
    createdAt: string;
    mobile: string;
    utm: Record<string, string> | null;
  };
  application: null | {
    referenceNo: string;
    fullName: string;
    dob: string;
    pan: string;
    email: string;
    employer: string;
    pincode: string;
    city: string;
    lender: string;
    apr: number;
    amount: number;
    emi: number;
    createdAt: string;
  };
  offers: { id: string; lender: string; apr: number; amount: number; emi: number; best_match: boolean }[];
  notes: {
    id: string;
    by: string | null;
    from: string | null;
    to: string | null;
    body: string | null;
    at: string;
  }[];
  consents: { purpose: string; text_version: string; source: string; granted_at: string }[];
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-hairline py-2 text-sm last:border-0">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-semibold text-ink">{v}</dd>
    </div>
  );
}

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, reload } = useAdmin<Detail>(`/leads/${id}`);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (error) return <p className="field-error">{error}</p>;
  if (!data) return <Loading />;
  const { lead, application: a } = data;

  async function save(extra: { assignToMe?: boolean } = {}) {
    setSaving(true);
    setMsg(null);
    try {
      await adminSend('PATCH', `/leads/${id}`, {
        ...(status ? { status } : {}),
        ...(note.trim() ? { note } : {}),
        ...extra,
      });
      setNote('');
      setStatus('');
      reload();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Link href="/admin/leads" className="text-sm font-semibold text-indigo">
        ← All leads
      </Link>
      <PageHead
        title={PRODUCTS[lead.product]?.name ?? lead.product}
        sub={`Received ${when(lead.createdAt)}`}
        actions={<Status value={lead.status} />}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel>
            <h2 className="mb-2 font-bold text-ink">Request</h2>
            <dl>
              <KV
                k="Mobile"
                v={
                  <a href={`tel:+91${lead.mobile}`} className="text-indigo">
                    {lead.mobile}
                  </a>
                }
              />
              <KV k="Amount" v={inr(lead.amount)} />
              <KV k="Tenure" v={`${lead.tenureMonths} months`} />
              <KV k="Employment" v={label(lead.employment)} />
              <KV k="Monthly income" v={inr(lead.monthlyIncome)} />
              {lead.utm && <KV k="Campaign" v={Object.values(lead.utm).filter(Boolean).join(' / ')} />}
            </dl>
          </Panel>
          <Panel>
            <h2 className="mb-2 font-bold text-ink">Application</h2>
            {a ? (
              <dl>
                <KV k="Reference" v={a.referenceNo} />
                <KV k="Name" v={a.fullName} />
                <KV k="Date of birth" v={a.dob} />
                <KV k="PAN" v={a.pan} />
                <KV
                  k="Email"
                  v={
                    <a href={`mailto:${a.email}`} className="text-indigo">
                      {a.email}
                    </a>
                  }
                />
                <KV k="Employer" v={a.employer} />
                <KV k="City" v={`${a.city} ${a.pincode}`} />
                <KV k="Chosen offer" v={`${a.lender} · ${a.apr}% · ${inr(a.amount)} · EMI ${inr(a.emi)}`} />
              </dl>
            ) : (
              <p className="text-sm text-muted">
                The customer saw offers but has not submitted details yet. Call them to help finish.
              </p>
            )}
          </Panel>
          <Panel>
            <h2 className="mb-3 font-bold text-ink">Offers shown ({data.offers.length})</h2>
            {data.offers.length === 0 ? (
              <p className="text-sm text-muted">No lender matched. Check eligibility manually.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {data.offers.map((o) => (
                  <li key={o.id} className="flex justify-between gap-3">
                    <span>
                      {o.lender}
                      {o.best_match && <span className="ml-2 text-xs font-bold text-green">best match</span>}
                    </span>
                    <span className="tabular-nums">
                      {o.apr}% · {inr(o.amount)} · {inr(o.emi)}/mo
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel>
            <h2 className="mb-2 font-bold text-ink">Consent record</h2>
            <ul className="text-sm text-muted">
              {data.consents.map((c, i) => (
                <li key={i}>
                  {label(c.purpose)} ({c.text_version}) via {c.source}, {when(c.granted_at)}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel>
            <h2 className="mb-3 font-bold text-ink">Update</h2>
            <label className="field-label" htmlFor="st">
              Status
            </label>
            <select
              id="st"
              className="field-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Keep as {label(lead.status)}</option>
              {LEAD_STATUSES.filter((s) => s !== lead.status).map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </select>
            <label className="field-label mt-3 block" htmlFor="note">
              Note
            </label>
            <textarea
              id="note"
              rows={3}
              className="field-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened on the call"
            />
            {msg && (
              <p className="field-error mt-2" role="alert">
                {msg}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                disabled={saving || (!status && !note.trim())}
                onClick={() => save()}
              >
                Save
              </button>
              <button className="btn btn-ghost" disabled={saving} onClick={() => save({ assignToMe: true })}>
                Assign to me
              </button>
            </div>
          </Panel>
          <Panel>
            <h2 className="mb-3 font-bold text-ink">History</h2>
            {data.notes.length === 0 ? (
              <p className="text-sm text-muted">Nothing yet.</p>
            ) : (
              <ol className="space-y-3 text-sm">
                {data.notes.map((n) => (
                  <li key={n.id}>
                    <p className="text-xs text-muted">
                      {when(n.at)} · {n.by ?? 'Staff'}
                    </p>
                    {n.to && (
                      <p className="font-semibold text-ink">
                        {label(n.from ?? '')} → {label(n.to)}
                      </p>
                    )}
                    {n.body && <p className="text-ink">{n.body}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
