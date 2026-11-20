import type { Metadata } from 'next';
import { ContactShell } from '@/components/contact/ContactShell';
import { PartnerForm } from '@/components/contact/PartnerForm';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbLd, pageMetadata, webPageLd } from '@/lib/seo';

const title = 'Become a DeepFinServ Partner';
const description =
  'Chartered accountants, agents, brokers and dealers: refer loan customers and earn a payout on every disbursal.';

export const metadata: Metadata = pageMetadata({ title, description, path: '/partner' });

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd(title, '/partner', description),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: title, path: '/partner' },
          ]),
        ]}
      />
      <ContactShell active="/partner">
        <PartnerForm />
      </ContactShell>
    </>
  );
}
