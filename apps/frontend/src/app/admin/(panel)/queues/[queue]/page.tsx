'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, use, useState } from 'react';
import { PRODUCTS, type ProductSlug } from '@dk/shared';
import { Empty, Loading, PageHead, Pager, Status } from '@/components/admin/ui';
import { adminSend, label, useAdmin, when } from '@/components/admin/useAdmin';
import { QUEUE_STATUSES } from '@/components/admin/statuses';
import { ApiError } from '@/lib/api';

type Row = Record<string, string | null> & { id: string; status: string; created_at: string };

const META: Record<string, { title: string; sub: string; fields: [string, string][] }> = {
  callbacks: {
    title: 'Callbacks',
    sub: 'People who asked us to call them.',
    fields: [
      ['name', 'Name'],
      ['mobile', 'Mobile'],
      ['product_slug', 'Product'],
      ['city', 'City'],
      ['slot', 'Best time'],
    ],
  },
  'credit-score': {
    title: 'Credit score requests',
    sub: 'Pull the report with consent, then call back with the score and advice.',
    fields: [
      ['reference_no', 'Reference'],
      ['full_name', 'Name'],
      ['mobile', 'Mobile'],
      ['pan', 'PAN'],
    ],
  },
  grievances: {
    title: 'Grievances',
    sub: 'RBI expects a reply within 30 days. Overdue items are marked.',
    fields: [
      ['ticket_no', 'Ticket'],
      ['name', 'Name'],
      ['mobile', 'Mobile'],
      ['category', 'Category'],
      ['reference_no', 'Their reference'],
      ['message', 'Message'],
    ],
  },
  partners: {
    title: 'Partner sign-ups',
    sub: 'People who want to refer customers.',
    fields: [
      ['name', 'Name'],
      ['mobile', 'Mobile'],
      ['email', 'Email'],
      ['city', 'City'],
      ['profession', 'Profession'],
      ['experience', 'Experience'],
    ],
  },
};

function Item({ queue, row, onSaved }: { queue: string; row: Row; onSaved: () => void }) {
  const [status, setStatus] = useState(row.status);
  const [resolution, setResolution] = useState(row.resolution ?? '');
  const [err, setErr] = useState<string | null>(null);
  const meta = META[queue]!;
  const overdue =
    queue === 'grievances' &&
    row.due_at &&
    ['open', 'in_progress'].includes(row.status) &&
    new Date(row.due_at) < new Date();
  const dirty = status !== row.status || (queue === 'grievances' && resolution !== (row.resolution ?? ''));

  async function save() {
    setErr(null);
    try {
      await adminSend('PATCH', `/queues/${queue}/${row.id}`, {
        status,
        ...(queue === 'grievances' ? { resolution } : {}),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not save');
    }
  }

  return (
    <li className="rounded-2xl border border-hairline bg-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {when(row.created_at)}
          {row.due_at && ` · reply by ${when(row.due_at)}`}
        </p>
        <div className="flex items-center gap-2">
          {overdue && <span className="text-xs font-bold text-danger">Overdue</span>}
          <Status value={row.status} />
        </div>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {meta.fields.map(([k, l]) => {
          const raw = row[k];
          const v =
            k === 'product_slug'
              ? raw
                ? PRODUCTS[raw as ProductSlug]?.name
                : 'Not sure yet'
              : k === 'slot' && raw
                ? label(raw)
                : raw;
          return (
            <div key={k} className={k === 'message' ? 'sm:col-span-2' : ''}>
              <dt className="text-xs text-muted">{l}</dt>
              <dd className="font-semibold whitespace-pre-wrap text-ink">
                {k === 'mobile' && v ? (
                  <a className="text-indigo" href={`tel:+91${v}`}>
                    {v}
                  </a>
                ) : (
                  v || '—'
                )}
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-hairline pt-4">
        <div>
          <label className="field-label" htmlFor={`s-${row.id}`}>
            Status
          </label>
          <select
            id={`s-${row.id}`}
            className="field-input w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {QUEUE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </div>
        {queue === 'grievances' && (
          <div className="min-w-[240px] flex-1">
            <label className="field-label" htmlFor={`r-${row.id}`}>
              Resolution sent to the customer
            </label>
            <textarea
              id={`r-${row.id}`}
              rows={2}
              className="field-input"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
        )}
        <button className="btn btn-primary" disabled={!dirty} onClick={save}>
          Save
        </button>
        {err && (
          <p className="field-error" role="alert">
            {err}
          </p>
        )}
      </div>
    </li>
  );
}

function Queue({ queue }: { queue: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const page = Number(sp.get('page') ?? 1);
  const { data, error, reload } = useAdmin<{ total: number; pageSize: number; data: Row[] }>(
    `/queues/${queue}?${sp.toString()}`,
  );
  const meta = META[queue]!;
  return (
    <>
      <PageHead title={meta.title} sub={meta.sub} />
      <select
        aria-label="Status"
        className="field-input mb-4 w-auto"
        value={sp.get('status') ?? ''}
        onChange={(e) =>
          router.replace(`/admin/queues/${queue}${e.target.value ? `?status=${e.target.value}` : ''}`)
        }
      >
        <option value="">All</option>
        {QUEUE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {label(s)}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && <Empty>Nothing here.</Empty>}
      {data && data.data.length > 0 && (
        <>
          <ul className="space-y-4">
            {data.data.map((r) => (
              <Item key={`${r.id}-${r.status}`} queue={queue} row={r} onSaved={reload} />
            ))}
          </ul>
          <Pager
            page={page}
            total={data.total}
            size={data.pageSize}
            href={(p) => {
              const n = new URLSearchParams(sp.toString());
              n.set('page', String(p));
              return `/admin/queues/${queue}?${n.toString()}`;
            }}
          />
        </>
      )}
    </>
  );
}

export default function QueuePage({ params }: { params: Promise<{ queue: string }> }) {
  const { queue } = use(params);
  if (!META[queue]) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <Queue queue={queue} />
    </Suspense>
  );
}
