import type { Metadata } from 'next';
import { LegalDraftNotice, ProsePage } from '@/components/layout/ProsePage';
import { pageMetadata } from '@/lib/seo';

const description = 'Terms for using the DeepFinServ website and loan comparison service.';
export const metadata: Metadata = pageMetadata({ title: 'Terms of Use', description, path: '/terms' });

export default function TermsPage() {
  return (
    <ProsePage title="Terms of use" intro={description} path="/terms">
      <LegalDraftNotice />
      <h2>Our role</h2>
      <p>
        DeepFinServ is a Direct Selling Agent. We do not lend. Lenders decide on every application under
        their own policies.
      </p>
      <h2>Offers shown</h2>
      <p>
        Offers are indicative and based on the details you give. Final terms are in the lender&apos;s sanction
        letter and Key Fact Statement.
      </p>
      <h2>No fees</h2>
      <p>We do not charge borrowers. Do not pay anyone who asks for money in the name of DeepFinServ.</p>
    </ProsePage>
  );
}
