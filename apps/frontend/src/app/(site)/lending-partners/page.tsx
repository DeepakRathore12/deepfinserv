import type { Metadata } from 'next';
import Link from 'next/link';
import { LENDER_TYPE_LABEL } from '@dk/shared';
import { ProsePage } from '@/components/layout/ProsePage';
import { api } from '@/lib/api';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const revalidate = 3600;
const description =
  'The banks, NBFCs and housing finance companies DeepFinServ works with, as required under the RBI Digital Lending Directions, 2025.';
export const metadata: Metadata = pageMetadata({
  title: 'Our Lending Partners',
  description,
  path: '/lending-partners',
});

interface Lender {
  id: string;
  name: string;
  lenderType: keyof typeof LENDER_TYPE_LABEL;
  regulator: string;
  website: string | null;
  grievanceContact: string | null;
}

async function getLenders(): Promise<Lender[] | null> {
  try {
    return (await api<{ data: Lender[] }>('/lenders', { next: { revalidate: 3600 } })).data;
  } catch {
    return null;
  }
}

export default async function LendingPartnersPage() {
  const lenders = await getLenders();
  return (
    <ProsePage title="Our lending partners" intro={description} path="/lending-partners">
      <p>
        DeepFinServ acts as a Lending Service Provider for the regulated entities below. Each lender
        decides on your loan under its own credit policy and issues a Key Fact Statement before you sign.
      </p>
      {lenders && lenders.length ? (
        <div className="not-prose overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[14.5px]">
            <thead>
              <tr className="text-left text-[13px] text-muted">
                <th className="py-2.5 pr-3 font-semibold">Lender</th>
                <th className="py-2.5 pr-3 font-semibold">Type</th>
                <th className="py-2.5 pr-3 font-semibold">Regulator</th>
                <th className="py-2.5 font-semibold">Grievance contact</th>
              </tr>
            </thead>
            <tbody>
              {lenders.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <td className="py-3 pr-3 font-semibold text-ink">
                    {l.website ? (
                      <a href={l.website} rel="noopener noreferrer" target="_blank">
                        {l.name}
                      </a>
                    ) : (
                      l.name
                    )}
                  </td>
                  <td className="py-3 pr-3">{LENDER_TYPE_LABEL[l.lenderType]}</td>
                  <td className="py-3 pr-3">{l.regulator}</td>
                  <td className="py-3">{l.grievanceContact ?? 'See lender website'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Our partner list is being updated. Call us on {SITE.phoneDisplay} for the current list.</p>
      )}
      <h2>Complaints</h2>
      <p>
        For a complaint about our service, use our <Link href="/grievance">grievance form</Link>. For a
        complaint about a sanctioned loan, contact the lender&apos;s grievance officer. If it is not resolved
        within 30 days, you can complain on the{' '}
        <a href="https://cms.rbi.org.in" rel="noopener noreferrer" target="_blank">
          RBI Complaint Management System
        </a>
        . Report suspicious deposit or lending schemes on{' '}
        <a href="https://sachet.rbi.org.in" rel="noopener noreferrer" target="_blank">
          Sachet
        </a>
        .
      </p>
    </ProsePage>
  );
}
