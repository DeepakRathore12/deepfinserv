import Link from 'next/link';
import { Check, FileText } from 'lucide-react';
import { BASE_DOCS, type Product } from '@dk/shared';
import { Tabs } from '../ui/Tabs';
import { FaqList } from '../ui/FaqList';

export function ProductTabs({ p }: { p: Product }) {
  const docGroups = [
    { title: 'If you are salaried', items: [...BASE_DOCS.salaried, ...p.extraDocs] },
    { title: 'If you are self-employed', items: [...BASE_DOCS.self, ...p.extraDocs] },
  ];
  return (
    <Tabs
      label={`${p.name} details`}
      items={[
        {
          id: 'features',
          label: 'Features',
          panel: (
            <ul className="m-0 grid list-none grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-0">
              {p.features.map((f) => (
                <li key={f.t} className="lift flex flex-col gap-2.5 rounded-3xl bg-card p-5 sm:p-6 hover:bg-lilac">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"
                  >
                    <Check size={20} strokeWidth={2} className="text-indigo" />
                  </span>
                  <h3 className="m-0 font-display text-lg sm:text-[19px] font-bold tracking-[-0.3px]">{f.t}</h3>
                  <p className="m-0 text-sm sm:text-[14.5px] leading-relaxed text-muted">{f.d}</p>
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: 'eligibility',
          label: 'Eligibility',
          panel: (
            <div className="flex flex-wrap gap-4">
              <div className="flex min-w-0 flex-[2_1_480px] flex-col gap-3.5 rounded-3xl bg-card p-5 sm:p-7">
                <h3 className="m-0 font-display text-lg sm:text-[21px] font-bold">Who can apply</h3>
                <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm sm:text-[15px] leading-[1.55]">
                  {p.eligibility.map((e) => (
                    <li key={e} className="flex items-start gap-3">
                      <Check aria-hidden size={20} className="mt-px flex-none text-green" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex min-w-0 flex-[1_1_280px] flex-col justify-between gap-3.5 rounded-3xl bg-navy p-5 sm:p-7 text-white">
                <span className="flex flex-col gap-2">
                  <h3 className="m-0 font-display text-lg sm:text-[21px] font-bold">Not sure you qualify?</h3>
                  <span className="text-sm sm:text-[14.5px] leading-relaxed text-on-navy">
                    Check your exact eligibility in 2 minutes. It does not affect your CIBIL score.
                  </span>
                </span>
                <Link href={`/apply?product=${p.slug}`} className="btn bg-marigold text-ink hover:text-ink">
                  Check eligibility
                </Link>
              </div>
            </div>
          ),
        },
        {
          id: 'documents',
          label: 'Documents',
          panel: (
            <div className="flex flex-wrap gap-4">
              {docGroups.map((g) => (
                <div
                  key={g.title}
                  className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5 rounded-3xl bg-card p-5 sm:p-7"
                >
                  <h3 className="m-0 font-display text-lg sm:text-[21px] font-bold">{g.title}</h3>
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm sm:text-[15px]">
                    {g.items.map((d) => (
                      <li key={d} className="flex items-start gap-3">
                        <FileText
                          aria-hidden
                          size={18}
                          strokeWidth={1.8}
                          className="mt-0.5 flex-none text-indigo"
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'fees',
          label: 'Rates and fees',
          panel: (
            <div className="overflow-x-auto rounded-3xl bg-card px-4 sm:px-7 py-2">
              <table className="w-full min-w-0 sm:min-w-[460px] border-collapse text-sm sm:text-[15px]">
                <tbody>
                  {p.fees.map((r) => (
                    <tr key={r.k} className="border-b border-line">
                      <th scope="row" className="py-3 sm:py-[18px] text-left font-semibold text-muted">
                        {r.k}
                      </th>
                      <td className="py-3 sm:py-[18px] text-right font-bold">{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="m-0 py-4 text-[13px] text-subtle">
                Rates and charges vary by lender and your profile. GST applies on fees. You will see exact
                terms in the lender&apos;s Key Fact Statement before you sign.
              </p>
            </div>
          ),
        },
        {
          id: 'faqs',
          label: 'FAQs',
          panel: (
            <div className="max-w-[860px]">
              <FaqList items={p.faqs} tone="card" />
            </div>
          ),
        },
      ]}
    />
  );
}
