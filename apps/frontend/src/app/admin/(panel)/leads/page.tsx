'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PRODUCT_LIST } from '@dk/shared';
import { Empty, Loading, PageHead, Pager, Status, Table } from '@/components/admin/ui';
import { inr, label, useAdmin, when } from '@/components/admin/useAdmin';
import { LEAD_STATUSES } from '@/components/admin/statuses';

interface Row {
  id: string;
  product: string;
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
  status: string;
  createdAt: string;
  mobile: string;
  referenceNo: string | null;
  assignedTo: string | null;
}

function Leads() {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = new URLSearchParams(sp.toString());
  const page = Number(sp.get('page') ?? 1);
  const { data, error } = useAdmin<{ total: number; pageSize: number; data: Row[] }>(
    `/leads?${qs.toString()}`,
  );
  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp.toString());
    if (v) n.set(k, v);
    else n.delete(k);
    n.delete('page');
    router.replace(`/admin/leads?${n.toString()}`);
  };
  const csv = new URLSearchParams(sp.toString());
  csv.delete('page');

  return (
    <>
      <PageHead
        title="Leads"
        sub={data ? `${data.total} matching` : undefined}
        actions={
          <a className="btn btn-ghost" href={`/api/v1/admin/leads.csv?${csv.toString()}`}>
            Export CSV
          </a>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          aria-label="Status"
          className="field-input w-auto"
          value={sp.get('status') ?? ''}
          onChange={(e) => set('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <select
          aria-label="Product"
          className="field-input w-auto"
          value={sp.get('product') ?? ''}
          onChange={(e) => set('product', e.target.value)}
        >
          <option value="">All products</option>
          {PRODUCT_LIST.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="field-error">{error}</p>}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && <Empty>No leads match these filters.</Empty>}
      {data && data.data.length > 0 && (
        <>
          <Table
            head={[
              'Received',
              'Product',
              'Amount',
              'Income / month',
              'Mobile',
              'Status',
              'Application',
              'Owner',
            ]}
          >
            {data.data.map((r) => (
              <tr key={r.id} className="hover:bg-surface">
                <td className="px-4 py-3">
                  <Link className="font-semibold text-indigo" href={`/admin/leads/${r.id}`}>
                    {when(r.createdAt)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {PRODUCT_LIST.find((p) => p.slug === r.product)?.name ?? r.product}
                </td>
                <td className="px-4 py-3">
                  {inr(r.amount)} · {r.tenureMonths} mo
                </td>
                <td className="px-4 py-3">{inr(r.monthlyIncome)}</td>
                <td className="px-4 py-3 tabular-nums">
                  <a href={`tel:+91${r.mobile}`} className="font-semibold text-ink hover:text-indigo">
                    {r.mobile}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <Status value={r.status} />
                </td>
                <td className="px-4 py-3">{r.referenceNo ?? <span className="text-muted">Not yet</span>}</td>
                <td className="px-4 py-3">
                  {r.assignedTo ?? <span className="text-muted">Unassigned</span>}
                </td>
              </tr>
            ))}
          </Table>
          <Pager
            page={page}
            total={data.total}
            size={data.pageSize}
            href={(p) => {
              const n = new URLSearchParams(sp.toString());
              n.set('page', String(p));
              return `/admin/leads?${n.toString()}`;
            }}
          />
        </>
      )}
    </>
  );
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Leads />
    </Suspense>
  );
}
