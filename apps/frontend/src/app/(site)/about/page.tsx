import type { Metadata } from 'next';
import Link from 'next/link';
import { ProsePage } from '@/components/layout/ProsePage';
import { pageMetadata } from '@/lib/seo';

const description =
  'DeepFinServ is a loan distributor helping borrowers compare and apply for loans from RBI-regulated banks and NBFCs, free of charge.';
export const metadata: Metadata = pageMetadata({ title: 'About DeepFinServ', description, path: '/about' });

export default function AboutPage() {
  return (
    <ProsePage title="About DeepFinServ" intro={description} path="/about">
      <h2>What we do</h2>
      <p>
        DeepFinServ is a Direct Selling Agent (DSA). We help you Get Loans and credit cards from
        banks, NBFCs and housing finance companies, then a DeepFinServ loan expert takes your application to the
        lender and follows it up until disbursal.
      </p>
      <h2>How we are paid</h2>
      <p>
        Our service is free for borrowers. Lenders pay us a commission when a loan we arranged is disbursed.
        We never ask you for money to approve a loan.
      </p>
      <h2>Who lends</h2>
      <p>
        Every loan is sanctioned and disbursed by a regulated lender under its own credit policy. See the full
        list on our <Link href="/lending-partners">lending partners</Link> page.
      </p>
    </ProsePage>
  );
}
