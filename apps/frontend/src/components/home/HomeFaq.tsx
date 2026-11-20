import type { Faq } from '@dk/shared';
import { FaqList } from '../ui/FaqList';
import { SITE } from '@/lib/site';

export const HOME_FAQS: Faq[] = [
  {
    q: 'Is DeepFinServ a bank?',
    a: 'No. DeepFinServ is a loan distributor (DSA). Loans are sanctioned and disbursed by our partner banks and NBFCs under their own credit policies.',
  },
  {
    q: 'Do I pay DeepFinServ any fee?',
    a: 'No. Our service is free for borrowers. Lenders pay us. Never pay anyone who claims to be from DeepFinServ for an approval.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your details are shared only with lenders you choose to apply to, with your consent.',
  },
  {
    q: 'Will checking my CIBIL score lower it?',
    a: 'No. Checking your own score is a soft enquiry and has no effect on it.',
  },
  {
    q: 'Which banks do you work with?',
    a: 'Public and private sector banks, NBFCs and housing finance companies, all regulated by the RBI or the NHB. See the full list on our lending partners page.',
  },
];

export function HomeFaq() {
  return (
    <section className="bg-surface">
      <div className="container-site flex flex-wrap gap-8 sm:gap-14 py-12 sm:py-16 md:py-[104px]">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
          <h2 className="h-display m-0">Questions people ask us</h2>
          <p className="m-0 text-base leading-relaxed text-muted">
            Call a loan expert on <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>, {SITE.hours}.
          </p>
        </div>
        <div className="min-w-0 flex-[2_1_560px]">
          <FaqList items={HOME_FAQS} />
        </div>
      </div>
    </section>
  );
}
