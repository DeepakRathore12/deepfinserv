import type { Faq } from '@dk/shared';
import { cn } from '@/lib/utils';

/** Native details/summary: accessible, works without JavaScript, and searchable by crawlers. */
export function FaqList({ items, tone = 'white' }: { items: Faq[]; tone?: 'white' | 'card' }) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((f) => (
        <details
          key={f.q}
          className={cn(
            'group reveal rounded-[20px] px-4 sm:px-6 py-4 sm:py-[22px]',
            tone === 'white' ? 'bg-white' : 'bg-card',
          )}
        >
          <summary className="flex justify-between items-center gap-3 sm:gap-4 text-base sm:text-[17px] font-bold">
            {f.q}
            <span
              aria-hidden
              className="text-xl leading-none text-indigo transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 mb-0 text-[15px] leading-[1.65] text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
