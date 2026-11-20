'use client';

import dynamic from 'next/dynamic';

/** The application flow reads browser-only state (the hero handoff), so it renders on the client only. */
export const ApplyClient = dynamic(() => import('./ApplyFlow').then((m) => m.ApplyFlow), {
  ssr: false,
  loading: () => <div className="h-[600px] animate-pulse rounded-[28px] bg-white" aria-label="Loading" />,
});
