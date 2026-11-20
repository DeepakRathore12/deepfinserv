import type { Metadata } from 'next';
import { ScoreFlow } from '@/components/score/ScoreFlow';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/ui/JsonLd';
import { CheckItem } from '@/components/ui/CheckItem';
import { breadcrumbLd, pageMetadata, webPageLd } from '@/lib/seo';

const description =
  'Check your credit score and full report for free. See what helps and hurts your score and the loans you can get. Checking never lowers your score.';

export const metadata: Metadata = pageMetadata({
  title: 'Check Your CIBIL Score for Free',
  description,
  path: '/credit-score',
});

const BANDS = [
  {
    r: '300 to 549',
    b: 'Poor',
    d: 'Most lenders will decline. Focus on clearing dues first.',
    bg: 'bg-rose',
    c: 'text-[#A31B1B]',
    ink: 'text-[#5A3333]',
  },
  {
    r: '550 to 649',
    b: 'Fair',
    d: 'Some NBFCs may lend, usually at higher rates.',
    bg: 'bg-cream',
    c: 'text-[#8A5400]',
    ink: 'text-[#4A3D1A]',
  },
  {
    r: '650 to 749',
    b: 'Good',
    d: 'Approvals are likely. Better rates are within reach.',
    bg: 'bg-lilac',
    c: 'text-indigo',
    ink: 'text-[#3B4060]',
  },
  {
    r: '750 to 900',
    b: 'Excellent',
    d: 'Best rates and fastest approvals from most banks.',
    bg: 'bg-mint',
    c: 'text-green',
    ink: 'text-[#1F3D31]',
  },
];

const TIPS = [
  {
    t: 'Pay every EMI and card bill on time',
    d: 'Payment history carries the most weight. Set up auto-pay so nothing is ever late.',
  },
  {
    t: 'Keep card usage under 30%',
    d: 'Pay before the statement date, not just the due date, to report a lower balance.',
  },
  {
    t: 'Space out loan applications',
    d: 'Each formal application adds a hard enquiry. Compare offers first; that adds none.',
  },
  { t: 'Keep old cards open', d: 'Older accounts lengthen your credit history and help your score.' },
  {
    t: 'Check your report every month',
    d: 'Dispute any error with the bureau. Mistakes are common and fixable.',
  },
];

export default function CreditScorePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd('Check your CIBIL score for free', '/credit-score', description),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Credit score', path: '/credit-score' },
          ]),
        ]}
      />
      <section className="bg-mint">
        <div className="container-site flex flex-wrap items-center gap-12 pt-16 pb-20">
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-[22px]">
            <h1 className="a-up m-0 font-display text-[clamp(34px,4.6vw,56px)] leading-none font-extrabold tracking-[-1.8px]">
              Your credit score and full report, free
            </h1>
            <p className="m-0 max-w-[480px] text-[17px] leading-relaxed text-[#2D5444]">
              An advisor pulls your report with your consent, explains what is helping and hurting your score
              and shows the loans you can get. Checking your own score never lowers it.
            </p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] text-[#1F3D31]">
              <CheckItem>Report pulled only with your consent, never shared without it</CheckItem>
              <CheckItem>Personal tips to raise your score</CheckItem>
              <CheckItem>Loan options that fit your score</CheckItem>
            </ul>
          </div>
          <ScoreFlow />
        </div>
      </section>

      <section id="bands">
        <div className="container-site flex flex-col gap-8 py-[88px]">
          <h2 className="m-0 font-display text-[clamp(26px,3vw,36px)] leading-[1.05] font-extrabold tracking-[-1px]">
            What your score means
          </h2>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-0">
            {BANDS.map((b) => (
              <li key={b.r} className={`reveal flex flex-col gap-2 rounded-[22px] p-[22px] ${b.bg}`}>
                <strong className="font-display text-[22px]">{b.r}</strong>
                <span className={`font-bold ${b.c}`}>{b.b}</span>
                <span className={`text-sm leading-[1.55] ${b.ink}`}>{b.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="improve" className="bg-surface">
        <div className="container-site flex flex-col gap-8 py-[88px]">
          <h2 className="m-0 font-display text-[clamp(26px,3vw,36px)] leading-[1.05] font-extrabold tracking-[-1px]">
            How to improve your CIBIL score
          </h2>
          <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3 p-0">
            {TIPS.map((t, i) => (
              <li key={t.t} className="reveal flex flex-col gap-2 rounded-[22px] bg-white p-[22px]">
                <span className="font-display text-sm font-extrabold text-indigo">{i + 1}</span>
                <strong className="text-[17px]">{t.t}</strong>
                <span className="text-sm leading-[1.55] text-muted">{t.d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <SiteFooter withCta={false} />
    </>
  );
}
