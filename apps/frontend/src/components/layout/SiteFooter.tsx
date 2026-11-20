import Link from 'next/link';
import { FOOTER_PRODUCTS, SITE } from '@/lib/site';
import { ArrowChip } from '../ui/ArrowChip';

const linkCls = 'text-on-navy no-underline hover:text-white';

export function SiteFooter({ withCta = true }: { withCta?: boolean }) {
  return (
    <footer className="bg-navy text-on-navy">
      <div className={`container-site flex flex-col gap-10 sm:gap-14 pb-12 max-[720px]:pb-28 md:pb-9 ${withCta ? 'pt-10 sm:pt-[72px]' : 'pt-8 sm:pt-12'}`}>
        {withCta ? (
          <div className="flex flex-wrap items-center justify-between gap-5 sm:gap-6 rounded-[24px] sm:rounded-[32px] bg-indigo p-6 sm:p-[clamp(28px,4vw,44px)]">
            <h2 className="m-0 max-w-[600px] font-display text-[clamp(24px,3.6vw,44px)] leading-[1.05] sm:leading-[1.02] font-extrabold tracking-[-1.2px] sm:tracking-[-1.4px] text-white">
              See your loan offers in two minutes
            </h2>
            <Link
              href="/apply"
              className="group inline-flex min-h-12 sm:min-h-14 items-center gap-3 sm:gap-4 rounded-full bg-marigold py-0 pr-2 pl-5 sm:pl-[26px] text-sm sm:text-base font-bold text-ink no-underline hover:text-ink"
            >
              Check eligibility
              <ArrowChip tone="ink" />
            </Link>
          </div>
        ) : null}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-sm">
          <div className="flex max-w-[320px] flex-[1_1_260px] flex-col gap-3">
            <span className="font-display text-[21px] font-extrabold text-white">DeepFinServ</span>
            <address className="not-italic leading-[1.7]">
              {SITE.address}
              <br />
              Toll free:{' '}
              <a href={SITE.phoneHref} className={linkCls}>
                {SITE.phoneDisplay}
              </a>
              <br />
              <a href={`mailto:${SITE.email}`} className={linkCls}>
                {SITE.email}
              </a>
            </address>
          </div>
          <FooterCol title="Products" links={FOOTER_PRODUCTS} />
          <FooterCol
            title="Company"
            links={[
              { href: '/about', label: 'About us' },
              { href: '/partner', label: 'Become a partner' },
              { href: '/contact', label: 'Contact' },
            ]}
          />
          <FooterCol
            title="Useful links"
            links={[
              { href: '/lending-partners', label: 'Our lending partners' },
              { href: '/calculators/emi', label: 'Calculators' },
              { href: '/grievance', label: 'Grievance redressal' },
              { href: '/privacy', label: 'Privacy policy' },
              { href: '/terms', label: 'Terms of use' },
            ]}
          />
        </div>
        <p className="m-0 border-t border-white/15 pt-6 text-[12.5px] leading-[1.7] text-on-navy-quiet">
          DeepFinServ is a Direct Selling Agent and does not lend. Loans are sanctioned and disbursed by
          RBI-regulated partner banks, NBFCs and housing finance companies at their sole discretion. Rates
          shown are indicative. Grievance Officer: {SITE.grievanceOfficer},{' '}
          <a href={`mailto:${SITE.grievanceEmail}`} className="text-on-navy-quiet hover:text-white">
            {SITE.grievanceEmail}
          </a>
          . Complaints not resolved in 30 days can be raised on the{' '}
          <a
            href="https://cms.rbi.org.in"
            className="text-on-navy-quiet hover:text-white"
            rel="noopener noreferrer"
            target="_blank"
          >
            RBI Complaint Management System
          </a>
          . © {new Date().getFullYear()} DeepFinServ.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-bold text-white">{title}</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={linkCls}>
          {l.label}
        </Link>
      ))}
    </div>
  );
}
