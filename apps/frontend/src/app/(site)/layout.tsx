import type React from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { MobileBar } from '@/components/layout/MobileBar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="pb-16 max-[720px]:pb-24 md:pb-0">{children}</main>
      <MobileBar />
    </>
  );
}
