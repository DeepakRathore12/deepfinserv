import Link from 'next/link';
import { FileText } from 'lucide-react';
import { formatINR } from '@dk/shared';
import { SITE } from '@/lib/site';
import type { ApplicationDone } from './types';

const NEXT = [
  { t: 'Expert call', d: 'We confirm your details and collect documents.' },
  { t: 'Lender checks', d: 'The lender verifies documents and may call or visit.' },
  { t: 'Sanction and disbursal', d: 'You sign the agreement and the money reaches your account.' },
];

export function StepDone({ done, isCard }: { done: ApplicationDone; isCard: boolean }) {
  return (
    <section className="card-step a-up" aria-labelledby="s5h">
      <div className="flex flex-wrap items-center gap-5">
        <span className="a-pop flex h-16 w-16 flex-none items-center justify-center rounded-full bg-mint">
          <svg
            aria-hidden
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B6E4C"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="a-draw" pathLength={1} d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 id="s5h" className="step-h1">
            You&apos;re all set, {done.firstName}
          </h1>
          <p className="step-sub">
            Application <strong className="text-ink">{done.referenceNo}</strong> is with your loan expert.
            We&apos;ve sent a copy to {done.email}.
          </p>
        </div>
      </div>
      <dl className="m-0 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-[20px] bg-card p-4 sm:p-5">
        <Item k="Lender" v={done.lenderName} />
        <Item k="APR" v={`${done.apr.toFixed(2)}%`} />
        {!isCard ? <Item k="EMI" v={formatINR(done.emi)} /> : null}
        <Item k={isCard ? 'Limit up to' : 'Amount'} v={formatINR(done.amount)} />
      </dl>
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5 rounded-[20px] bg-navy p-[22px] text-white">
          <span className="text-[13px] text-on-navy">Your loan expert</span>
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full bg-marigold font-extrabold text-ink"
            >
              DK
            </span>
            <span className="flex flex-col">
              <strong>Assigned to your application</strong>
              <span className="text-[13.5px] text-on-navy">Calls you within 2 working hours</span>
            </span>
          </span>
          <div className="flex flex-wrap gap-2">
            <a href={SITE.phoneHref} className="btn min-h-11 bg-white text-sm text-navy hover:text-navy">
              Call us now
            </a>
            <a
              href={SITE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn min-h-11 bg-[#25D366] text-sm text-[#08361C] hover:text-[#08361C]"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded-[20px] border-[1.5px] border-line p-[22px]">
          <strong className="text-base">Keep these ready</strong>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14.5px] text-[#3B4060]">
            {done.documents.map((d) => (
              <li key={d} className="flex items-start gap-2.5">
                <FileText aria-hidden size={18} strokeWidth={1.8} className="mt-0.5 flex-none text-indigo" />
                {d}
              </li>
            ))}
          </ul>
          <span className="field-hint">Your loan expert will tell you how to share them securely.</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <strong className="text-base">What happens next</strong>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 p-0">
          {NEXT.map((n, i) => (
            <li key={n.t} className="flex flex-col gap-1.5 rounded-[18px] bg-card p-4">
              <span className="font-extrabold text-indigo">{i + 1}</span>
              <strong className="text-[15px]">{n.t}</strong>
              <span className="text-[13.5px] text-muted">{n.d}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="step-actions justify-start">
        <Link href="/" className="btn btn-ghost w-full sm:w-auto">
          Back to home
        </Link>
        {/* <Link href="/credit-score" className="btn btn-ghost">
          Check my free credit score
        </Link> */}
      </div>
    </section>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[12.5px] text-muted">{k}</dt>
      <dd className="m-0 font-bold">{v}</dd>
    </div>
  );
}
