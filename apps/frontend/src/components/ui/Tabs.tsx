'use client';

import type React from 'react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  panel: React.ReactNode;
}

/**
 * Accessible tabs. Every panel is rendered into the HTML (hidden when inactive) so search engines and
 * no-JavaScript visitors still get the full content.
 */
export function Tabs({ items, label }: { items: TabItem[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? '');
  const base = useId();
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = items.at((i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length);
    if (next) {
      setActive(next.id);
      document.getElementById(`${base}-tab-${next.id}`)?.focus();
    }
  };
  return (
    <div className="flex flex-col gap-7">
      <div
        role="tablist"
        aria-label={label}
        className="flex max-w-full gap-1 self-start overflow-x-auto rounded-full bg-surface p-[5px]"
      >
        {items.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              id={`${base}-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'min-h-[42px] cursor-pointer rounded-full border-0 px-[18px] text-sm font-semibold whitespace-nowrap transition-colors',
                on ? 'bg-white text-navy shadow-[0_1px_3px_rgba(18,22,51,.12)]' : 'bg-transparent text-muted',
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          id={`${base}-panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== active}
          className={t.id === active ? 'a-up' : undefined}
        >
          {t.panel}
        </div>
      ))}
    </div>
  );
}
