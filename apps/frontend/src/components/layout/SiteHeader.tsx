'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import { NAV, SITE } from '@/lib/site';
import { Logo } from './Logo';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-white/95 backdrop-blur-md">
      <div className="container-site flex items-center justify-between gap-4 py-3 sm:py-3.5">
        <Logo />

        {/* Desktop Navigation */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-1.5 text-[15px] font-semibold">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-ink no-underline hover:text-indigo rounded-lg transition-colors hover:bg-surface"
            >
              {item.label}
              {'caret' in item && item.caret ? (
                <ChevronDown aria-hidden size={12} className="text-muted" />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA & Phone */}
        <div className="hidden sm:flex items-center gap-2">
          <a
            href={SITE.phoneHref}
            className="inline-flex min-h-11 items-center gap-2 px-3 lg:px-4 text-[14px] lg:text-[15px] font-bold text-indigo no-underline hover:text-navy"
          >
            <Phone aria-hidden size={16} />
            <span className="hidden md:inline">{SITE.phoneDisplay}</span>
            <span className="md:hidden">Call</span>
          </a>
          <Link href="/apply" className="btn btn-primary min-h-10 lg:min-h-11 px-4 lg:px-5 text-sm lg:text-[15px]">
            Apply now
          </Link>
        </div>

        {/* Mobile Action buttons + Hamburger toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/apply"
            className="sm:hidden btn btn-primary min-h-9 px-3.5 text-xs font-bold"
          >
            Apply
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open navigation menu'}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-ink hover:text-indigo transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-hairline bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="container-site flex flex-col gap-4 py-5">
            <nav aria-label="Mobile Main" className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-ink no-underline hover:bg-surface hover:text-indigo transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronDown aria-hidden size={16} className="-rotate-90 text-muted" />
                </Link>
              ))}
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-ink no-underline hover:bg-surface hover:text-indigo transition-colors"
              >
                <span>About us</span>
                <ChevronDown aria-hidden size={16} className="-rotate-90 text-muted" />
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-ink no-underline hover:bg-surface hover:text-indigo transition-colors"
              >
                <span>Contact</span>
                <ChevronDown aria-hidden size={16} className="-rotate-90 text-muted" />
              </Link>
            </nav>

            <div className="flex flex-col gap-2.5 pt-3 border-t border-hairline">
              <a
                href={SITE.phoneHref}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-surface px-4 text-base font-bold text-indigo no-underline hover:bg-lilac transition-colors"
              >
                <Phone aria-hidden size={18} />
                Call {SITE.phoneDisplay}
              </a>
              <Link
                href="/apply"
                onClick={() => setOpen(false)}
                className="btn btn-primary min-h-12 w-full text-base"
              >
                Apply now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
