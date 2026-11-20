import type React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Staff | DeepFinServ', robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface">{children}</div>;
}
