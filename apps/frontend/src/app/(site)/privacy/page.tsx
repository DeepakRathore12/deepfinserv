import type { Metadata } from 'next';
import { LegalDraftNotice, ProsePage } from '@/components/layout/ProsePage';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

const description =
  'How DeepFinServ collects, uses, shares and protects your personal data, and how to withdraw consent.';
export const metadata: Metadata = pageMetadata({ title: 'Privacy Policy', description, path: '/privacy' });

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" intro={description} path="/privacy">
      <LegalDraftNotice />
      <h2>What we collect</h2>
      <ul>
        <li>Contact details: name, mobile number, email, city and pincode.</li>
        <li>Loan details: product, amount, tenure, employment type and income.</li>
        <li>
          Identity details for an application: date of birth and PAN. We do not collect Aadhaar numbers on
          this site.
        </li>
      </ul>
      <h2>Why we use it</h2>
      <p>
        To verify your number, show offers, send your application to the lender you choose, and contact you
        about it. Each use needs your consent, which we record with the time and the notice you saw.
      </p>
      <h2>Who we share it with</h2>
      <p>
        Only the lender you choose to apply to, and a credit bureau when you authorise a credit check. We
        never sell your data.
      </p>
      <h2>How we protect it</h2>
      <p>
        PAN and mobile numbers are encrypted at rest. Access is limited to staff who need it and every access
        is logged.
      </p>
      <h2>How long we keep it</h2>
      <p>
        Requests that do not become applications are deleted or anonymised after 12 months. Application
        records are kept for the period lenders and the law require.
      </p>
      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your data, or withdraw consent, by writing to{' '}
        {SITE.grievanceEmail}.
      </p>
    </ProsePage>
  );
}
