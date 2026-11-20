import Link from 'next/link';

const STEPS = [
  {
    t: 'Check eligibility',
    d: 'Share a few details. We check what you qualify for without touching your score.',
  },
  { t: 'Compare offers', d: 'See rates, EMIs and fees from matching lenders side by side.' },
  { t: 'Apply with an expert', d: 'A DeepFinServ loan expert collects documents and files with the lender.' },
  { t: 'Get disbursed', d: 'Money in your account. We stay on it until it lands.' },
];

export function Process() {
  return (
    <section id="how" className="bg-surface">
      <div className="container-site flex flex-col gap-8 sm:gap-12 py-12 sm:py-16 md:py-[104px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="h-display m-0 max-w-[620px]">Easy, quick, and handled for you</h2>
          <Link href="/apply" className="btn btn-primary min-h-12 px-[22px]">
            Get started
          </Link>
        </div>
        <ol className="m-0 grid list-none grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-0">
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <li
                key={s.t}
                className={`reveal flex min-h-[200px] sm:min-h-[230px] flex-col gap-3.5 sm:gap-[18px] rounded-[26px] p-5 sm:p-[26px] ${last ? 'bg-marigold' : 'bg-white'}`}
              >
                <span
                  aria-hidden
                  className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-lg font-extrabold text-white ${last ? 'bg-ink' : 'bg-indigo'}`}
                >
                  {i + 1}
                </span>
                <span className="font-display text-[22px] font-bold tracking-[-0.4px]">{s.t}</span>
                <span className={`text-[15px] leading-[1.55] ${last ? 'text-[#3D2E0A]' : 'text-muted'}`}>
                  {s.d}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
