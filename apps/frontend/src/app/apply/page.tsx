import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ApplyClient } from '@/components/apply/ApplyClient';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Check Your Loan Eligibility',
  description: 'See loan offers you qualify for in two minutes.',
  path: '/apply',
  noindex: true,
});

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="h-[600px] animate-pulse rounded-[28px] bg-white" />}>
      <ApplyClient />
    </Suspense>
  );
}
