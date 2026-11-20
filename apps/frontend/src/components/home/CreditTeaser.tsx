import Link from 'next/link';
import { ScoreGauge } from '../score/ScoreGauge';
import { ArrowChip } from '../ui/ArrowChip';
import { CheckItem } from '../ui/CheckItem';

const FACTS = [
  { k: 'Payment history', v: 'Excellent', c: 'text-green' },
  { k: 'Credit utilisation', v: '28%', c: '' },
  { k: 'Credit age', v: '4 yrs 2 mo', c: '' },
  { k: 'Enquiries', v: 'Needs care', c: 'text-marigold-deep' },
];

export function CreditTeaser() {
  return (
    <section id="cibil">
      <div className="container-site flex flex-wrap items-center gap-14 py-[104px]">
        <div className="flex min-w-0 flex-[1_1_400px] justify-center">
          <div className="w-full max-w-[440px] rounded-[32px] bg-mint p-2">
            <div className="flex flex-col gap-5 rounded-[26px] bg-white p-7">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold">Credit report</span>
                <span className="text-xs text-muted">Sample</span>
              </div>
              <div className="flex justify-center">
                <ScoreGauge
                  score={762}
                  band="Good"
                  bandColor="#0B6E4C"
                  draw="scroll"
                  label="Sample CIBIL score 762 out of 900, rated good"
                />
              </div>
              <dl className="m-0 grid grid-cols-2 gap-2.5">
                {FACTS.map((f) => (
                  <div key={f.k} className="flex flex-col-reverse gap-1 rounded-2xl bg-surface p-3.5">
                    <dt className="text-[12.5px] text-muted">{f.k}</dt>
                    <dd className={`m-0 text-[15px] font-bold ${f.c}`}>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[22px]">
          <h2 className="h-display m-0">Check your CIBIL score for free</h2>
          <p className="m-0 max-w-[480px] text-[17px] leading-relaxed text-muted">
            See your score, what is pulling it down, and which loans you can get right now. Checking your own
            score never lowers it.
          </p>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
            <CheckItem>Full report with every loan and card on your file</CheckItem>
            <CheckItem>What is helping and hurting your score</CheckItem>
            <CheckItem>Loans you can get at your current score</CheckItem>
          </ul>
          <Link
            href="/credit-score"
            className="group flex min-h-14 w-full max-w-[360px] items-center justify-between gap-3 rounded-full bg-green py-0 pr-2 pl-6 text-base font-bold text-white no-underline hover:bg-green-dark hover:text-white"
          >
            Get my free CIBIL score
            <ArrowChip tone="white" />
          </Link>
          <p className="m-0 text-sm text-muted">Free every month. No card details needed.</p>
        </div>
      </div>
    </section>
  );
}
