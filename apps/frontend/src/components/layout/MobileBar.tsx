import Link from 'next/link';

/** Sticky call and apply bar shown under 720 px, as in the design. */
export function MobileBar() {
  return (
    <div className="mbar-in fixed inset-x-3 bottom-3 z-20 hidden gap-1.5 rounded-full bg-ink p-1.5 shadow-[0_12px_30px_rgba(18,22,51,.3)] max-[720px]:flex">
      <Link
        href="/contact"
        className="flex min-h-12 flex-1 items-center justify-center text-sm font-semibold text-white no-underline hover:text-white"
      >
        Request a call
      </Link>
      <Link
        href="/apply"
        className="flex min-h-12 flex-[1.4] items-center justify-center rounded-full bg-marigold text-sm font-bold text-ink no-underline hover:text-ink"
      >
        Check eligibility
      </Link>
    </div>
  );
}
