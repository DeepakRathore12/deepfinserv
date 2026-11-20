import type { Metadata } from 'next';
import { ContactShell } from '@/components/contact/ContactShell';
import { GrievanceForm } from '@/components/contact/GrievanceForm';
import { JsonLd } from '@/components/ui/JsonLd';
import { breadcrumbLd, pageMetadata, webPageLd } from '@/lib/seo';

const title = 'Grievance Redressal';
const description =
  'Raise a complaint with DeepFinServ. We acknowledge within 24 hours and aim to resolve within 7 working days.';

export const metadata: Metadata = pageMetadata({ title, description, path: '/grievance' });

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd(title, '/grievance', description),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: title, path: '/grievance' },
          ]),
        ]}
      />
      <ContactShell active="/grievance">
        <GrievanceForm />
      </ContactShell>
    </>
  );
}
