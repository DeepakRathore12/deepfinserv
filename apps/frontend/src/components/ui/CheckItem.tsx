import type React from 'react';
import { Check } from 'lucide-react';

export function CheckItem({ children, color = '#0B6E4C' }: { children: React.ReactNode; color?: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <Check aria-hidden size={18} strokeWidth={2} color={color} className="flex-none" />
      <span>{children}</span>
    </li>
  );
}
