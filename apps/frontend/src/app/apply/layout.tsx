import type React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { SITE } from '@/lib/site';

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <Logo size={32} />
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="text-muted">
              <span className="hidden sm:inline">Need help? </span>
              <a href={SITE.phoneHref} className="font-bold text-indigo">
                Call {SITE.phoneDisplay}
              </a>
            </span>
            <Link href="/" className="font-semibold text-muted hover:text-ink">
              Exit
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto box-border w-full max-w-[1180px] flex-1 px-4 sm:px-6 pt-5 sm:pt-8 pb-12 sm:pb-[72px]">
        {children}
      </main>
      <footer className="bg-navy text-on-navy-quiet">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-6 text-[12.5px] leading-[1.7]">
          DeepFinServ is a Direct Selling Agent and does not lend. Loans are sanctioned and disbursed by
          RBI-regulated partner banks, NBFCs and housing finance companies at their sole discretion.{' '}
          <Link href="/grievance" className="text-white">
            Grievance redressal
          </Link>{' '}
          ·{' '}
          <Link href="/lending-partners" className="text-white">
            Our lending partners
          </Link>
        </div>
      </footer>
    </div>
  );
}
