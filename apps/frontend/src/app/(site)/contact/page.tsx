import type { Metadata } from 'next';
import { ContactShell } from '@/components/contact/ContactShell';
import { CallbackForm } from '@/components/contact/CallbackForm';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbLd, pageMetadata, webPageLd } from '@/lib/seo';

const title = 'Request a Callback from a Loan Expert';
const description = 'Ask a DeepFinServ loan expert to call you at a time that suits you. Free, with no obligation.';

export const metadata: Metadata = pageMetadata({ title, description, path: '/contact' });

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd(title, '/contact', description),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: title, path: '/contact' },
          ]),
        ]}
      />
      <ContactShell active="/contact">
        <CallbackForm />
      </ContactShell>
    </>
  );
}
