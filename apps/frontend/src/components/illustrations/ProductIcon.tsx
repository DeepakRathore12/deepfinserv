import type React from 'react';
import type { ProductSlug } from '@dk/shared';

const PATHS: Record<ProductSlug, React.ReactNode> = {
  'personal-loan': (
    <>
      <rect x="4" y="9" width="24" height="16" rx="3" />
      <circle cx="16" cy="17" r="3.5" />
      <path d="M8 13h2M22 21h2" />
    </>
  ),
  'home-loan': (
    <>
      <path d="M5 15L16 6l11 9" />
      <path d="M8 13v13h16V13" />
      <path d="M13 26v-7h6v7" />
    </>
  ),
  'business-loan': (
    <>
      <path d="M5 26V12l6 4V12l6 4V8h10v18z" />
      <path d="M9 21h2M15 21h2M21 21h2" />
    </>
  ),
  'loan-against-property': (
    <>
      <path d="M6 27V11l10-6 10 6v16" />
      <circle cx="16" cy="15" r="3" />
      <path d="M16 18v5M16 21h2.5" />
    </>
  ),
  'loan-against-securities': (
    <>
      <rect x="5" y="5" width="22" height="22" rx="3" />
      <path d="M9 21l5-5 4 3 6-7" />
      <path d="M20 12h4v4" />
    </>
  ),
  'education-loan': (
    <>
      <path d="M3 12l13-6 13 6-13 6z" />
      <path d="M9 15v6c3 3 11 3 14 0v-6" />
      <path d="M29 12v7" />
    </>
  ),
  'car-loan': (
    <>
      <path d="M6 20l2.5-7h15L26 20" />
      <rect x="4" y="20" width="24" height="5" rx="2" />
      <circle cx="9" cy="25" r="1.5" />
      <circle cx="23" cy="25" r="1.5" />
    </>
  ),
  'balance-transfer': (
    <>
      <path d="M5 11h20l-4-4" />
      <path d="M27 21H7l4 4" />
    </>
  ),
  'credit-cards': (
    <>
      <rect x="4" y="8" width="24" height="16" rx="3" />
      <path d="M4 13h24M8 19h6" />
    </>
  ),
};

export function ProductIcon({ slug, size = 26 }: { slug: ProductSlug; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="#2B3A9A"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[slug]}
    </svg>
  );
}
