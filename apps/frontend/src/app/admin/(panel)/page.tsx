'use client';

import Link from 'next/link';
import { PageHead, Panel, Loading } from '@/components/admin/ui';
import { useAdmin } from '@/components/admin/useAdmin';

interface Summary {
  leadsNew: number;
  leadsToday: number;
  callbacksOpen: number;
  scoreOpen: number;
  grievancesOpen: number;
  grievancesOverdue: number;
  partnersOpen: number;
}

export default function Overview() {
  const { data, error } = useAdmin<Summary>('/summary');
  if (error) return <p className="field-error">{error}</p>;
  if (!data) return <Loading />;
  const tiles = [
    { n: data.leadsNew, l: 'New leads', s: `${data.leadsToday} today`, href: '/admin/leads?status=new' },
    { n: data.callbacksOpen, l: 'Callbacks to make', href: '/admin/queues/callbacks?status=open' },
    { n: data.scoreOpen, l: 'Credit score requests', href: '/admin/queues/credit-score?status=open' },
    {
      n: data.grievancesOpen,
      l: 'Open grievances',
      s: data.grievancesOverdue ? `${data.grievancesOverdue} past 30 days` : 'None overdue',
      href: '/admin/queues/grievances?status=open',
      warn: data.grievancesOverdue > 0,
    },
    { n: data.partnersOpen, l: 'Partner sign-ups', href: '/admin/queues/partners?status=open' },
  ];
  return (
    <>
      <PageHead title="Overview" sub="What needs attention right now." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.l} href={t.href}>
            <Panel className="transition-shadow hover:shadow-md">
              <p className="h-display text-4xl text-ink">{t.n}</p>
              <p className="mt-1 font-semibold text-ink">{t.l}</p>
              {t.s && (
                <p className={`mt-1 text-sm ${t.warn ? 'font-bold text-danger' : 'text-muted'}`}>{t.s}</p>
              )}
            </Panel>
          </Link>
        ))}
      </div>
    </>
  );
}
