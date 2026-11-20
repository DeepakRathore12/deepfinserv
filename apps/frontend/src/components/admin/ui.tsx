import type React from 'react';
import Link from 'next/link';

export function PageHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="h-display text-[28px] leading-tight text-ink">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-hairline bg-white p-5 ${className}`}>{children}</div>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-hairline bg-white">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs font-bold tracking-wide text-muted uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">{children}</tbody>
      </table>
    </div>
  );
}

const TONE: Record<string, string> = {
  new: 'bg-lilac text-indigo',
  open: 'bg-lilac text-indigo',
  contacted: 'bg-cream text-marigold-deep',
  in_progress: 'bg-cream text-marigold-deep',
  documents_pending: 'bg-cream text-marigold-deep',
  submitted_to_lender: 'bg-cream text-marigold-deep',
  sanctioned: 'bg-mint text-green',
  disbursed: 'bg-mint text-green',
  resolved: 'bg-mint text-green',
  rejected: 'bg-rose text-danger',
  closed: 'bg-surface text-muted',
};

export function Status({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[value] ?? 'bg-surface text-muted'}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
}

export function Pager({
  page,
  total,
  size,
  href,
}: {
  page: number;
  total: number;
  size: number;
  href: (p: number) => string;
}) {
  const last = Math.max(1, Math.ceil(total / size));
  if (last === 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-end gap-3 text-sm" aria-label="Pages">
      {page > 1 && (
        <Link className="font-semibold text-indigo" href={href(page - 1)}>
          Previous
        </Link>
      )}
      <span className="text-muted">
        Page {page} of {last}
      </span>
      {page < last && (
        <Link className="font-semibold text-indigo" href={href(page + 1)}>
          Next
        </Link>
      )}
    </nav>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-hairline bg-white p-8 text-center text-sm text-muted">
      {children}
    </p>
  );
}

export function Loading() {
  return (
    <p className="p-8 text-sm text-muted" role="status">
      Loading…
    </p>
  );
}
