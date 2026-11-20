import type React from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';
import { SiteFooter } from '../layout/SiteFooter';

const TABS = [
  { href: '/contact', label: 'Request a callback' },
  { href: '/partner', label: 'Become a partner' },
  { href: '/grievance', label: 'Raise a grievance' },
] as const;

const HEADINGS = {
  '/contact': 'How can we help?',
  '/partner': 'Partner with DeepFinServ',
  '/grievance': 'Grievance redressal',
} as const;

export function ContactShell({
  active,
  children,
}: {
  active: (typeof TABS)[number]['href'];
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="bg-surface">
        <div className="container-site flex flex-col gap-6 sm:gap-7 pt-8 sm:pt-14 pb-12 sm:pb-[88px]">
          <div className="a-up flex max-w-[680px] flex-col gap-2.5 sm:gap-3">
            <h1 className="m-0 font-display text-[clamp(28px,4.8vw,56px)] leading-[1.05] sm:leading-none font-extrabold tracking-[-1.2px] sm:tracking-[-1.8px]">
              {HEADINGS[active]}
            </h1>
            <p className="m-0 text-base sm:text-[17px] leading-relaxed text-muted">
              Ask for a call from a loan expert, join us as a partner, or raise a complaint.
            </p>
          </div>
          <nav aria-label="Contact options">
            <ul className="m-0 flex list-none gap-1.5 overflow-x-auto p-0 pb-1">
              {TABS.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    aria-current={t.href === active ? 'page' : undefined}
                    className={cn(
                      'inline-flex min-h-10 sm:min-h-[46px] items-center rounded-full border-[1.5px] px-3.5 sm:px-5 text-xs sm:text-[15px] font-semibold whitespace-nowrap no-underline',
                      t.href === active
                        ? 'border-indigo bg-indigo text-white hover:text-white'
                        : 'border-line bg-white text-ink hover:border-[#c9ceee]',
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap items-start gap-5">
            <div className="min-w-0 flex-[2_1_560px]">{children}</div>
            <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
              <div className="flex flex-col gap-3.5 rounded-[28px] bg-white p-5 sm:p-[clamp(22px,4vw,36px)]">
                <h2 className="m-0 font-display text-xl font-bold">Reach us directly</h2>
                <Direct
                  href={SITE.phoneHref}
                  k={`Toll free, ${SITE.hours.replace('Monday to Saturday', 'Mon to Sat')}`}
                  v={SITE.phoneDisplay}
                />
                <Direct href={SITE.whatsappHref} k="WhatsApp" v={SITE.whatsappDisplay} />
                <Direct href={`mailto:${SITE.email}`} k="Email" v={SITE.email} />
                <address className="text-sm leading-relaxed text-muted not-italic">{SITE.address}</address>
              </div>
              <div className="flex flex-col gap-3 rounded-[28px] bg-navy p-[clamp(22px,4vw,36px)] text-white">
                <h2 className="m-0 font-display text-xl font-bold">Escalation path</h2>
                <ol className="m-0 flex list-none flex-col gap-3 p-0 text-sm leading-[1.55] text-on-navy">
                  <li className="flex gap-3">
                    <strong className="text-marigold">1</strong>
                    <span>
                      <strong className="text-white">Customer support.</strong> Call, WhatsApp or the callback
                      form.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <strong className="text-marigold">2</strong>
                    <span>
                      <strong className="text-white">Grievance Officer.</strong> {SITE.grievanceOfficer},{' '}
                      {SITE.grievanceEmail}, if not resolved in 7 working days.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <strong className="text-marigold">3</strong>
                    <span>
                      <strong className="text-white">Lender&apos;s grievance cell.</strong> For issues about
                      your sanctioned loan, then the{' '}
                      <a
                        className="text-white underline"
                        href="https://cms.rbi.org.in"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        RBI Ombudsman
                      </a>{' '}
                      if unresolved after 30 days.
                    </span>
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter withCta={false} />
    </>
  );
}

function Direct({ href, k, v }: { href: string; k: string; v: string }) {
  return (
    <a
      href={href}
      className="flex flex-col gap-0.5 rounded-2xl bg-card px-4 py-3.5 text-ink no-underline hover:text-ink"
    >
      <span className="text-[12.5px] text-muted">{k}</span>
      <strong className="text-[17px]">{v}</strong>
    </a>
  );
}
