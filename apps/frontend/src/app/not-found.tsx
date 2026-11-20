import Link from 'next/link';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-surface">
        <div className="container-site flex min-h-[60vh] flex-col items-start justify-center gap-5 py-20">
          <span className="font-display text-lg font-extrabold text-indigo">404</span>
          <h1 className="m-0 font-display text-[clamp(34px,4.6vw,52px)] leading-none font-extrabold tracking-[-1.6px]">
            This page doesn&apos;t exist
          </h1>
          <p className="m-0 max-w-[520px] text-[17px] leading-relaxed text-muted">
            The link may be old or mistyped. These are good places to start.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/" className="btn btn-primary">
              Go to home
            </Link>
            <Link href="/loans" className="btn btn-ghost">
              See all loans
            </Link>
            <Link href="/apply" className="btn btn-ghost">
              Check eligibility
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter withCta={false} />
    </>
  );
}
