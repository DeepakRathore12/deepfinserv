import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = {
  marigold: 'bg-marigold text-ink',
  ink: 'bg-ink text-white',
  white: 'bg-white text-green',
  indigo: 'bg-white text-indigo',
} as const;

/** The round arrow inside primary CTAs. Nudges right on hover of a parent `.group`. */
export function ArrowChip({
  tone = 'marigold',
  pulse = false,
}: {
  tone?: keyof typeof TONES;
  pulse?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'cta-arrow flex h-10 w-10 flex-none items-center justify-center rounded-full',
        TONES[tone],
        pulse && 'cta-pulse',
      )}
    >
      <ArrowRight size={16} strokeWidth={2.2} />
    </span>
  );
}
