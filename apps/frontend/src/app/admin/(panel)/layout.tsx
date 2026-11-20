'use client';

import type React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { useAdmin } from '@/components/admin/useAdmin';
import { api } from '@/lib/api';

interface Me {
  staff: { name: string; role: 'admin' | 'agent' };
}

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/queues/callbacks', label: 'Callbacks' },
  { href: '/admin/queues/credit-score', label: 'Credit score' },
  { href: '/admin/queues/grievances', label: 'Grievances' },
  { href: '/admin/queues/partners', label: 'Partners' },
  { href: '/admin/rate-cards', label: 'Rate cards' },
  { href: '/admin/lenders', label: 'Lenders' },
];

export default function Panel({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { data } = useAdmin<Me>('/auth/me');

  async function logout() {
    await api('/admin/auth/logout', { method: 'POST' }).catch(() => undefined);
    router.replace('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-hairline bg-white md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0">
        <div className="flex items-center justify-between p-5">
          <Logo size={32} />
        </div>
        <nav aria-label="Staff" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {NAV.map((n) => {
            const on = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap ${on ? 'bg-indigo text-white' : 'text-ink hover:bg-surface'}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        {data && (
          <div className="hidden border-t border-hairline p-5 text-sm md:block">
            <p className="font-bold text-ink">{data.staff.name}</p>
            <p className="text-muted capitalize">{data.staff.role}</p>
            <button onClick={logout} className="mt-3 font-semibold text-indigo">
              Sign out
            </button>
          </div>
        )}
      </aside>
      <main id="main" className="min-w-0 flex-1 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
