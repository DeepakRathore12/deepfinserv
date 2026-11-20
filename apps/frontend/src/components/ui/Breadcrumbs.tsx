import Link from 'next/link';
import type { Crumb } from '@/lib/seo';

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13.5px] text-muted">
      <ol className="m-0 flex list-none flex-wrap gap-1 p-0">
        {items.map((c, i) => (
          <li key={c.path} className="flex gap-1">
            {i < items.length - 1 ? (
              <>
                <Link href={c.path} className="text-muted">
                  {c.name}
                </Link>
                <span aria-hidden>/</span>
              </>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
