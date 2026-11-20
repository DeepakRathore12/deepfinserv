import Link from 'next/link';
import { api, browserApiUrl } from '@/lib/api';

interface Partner {
  id: string;
  name: string;
  logoPath: string | null;
  showOnHome: boolean;
  displayOrder: number;
}

/** Below this many partners the logos sit in a still row; a scrolling strip would look sparse. */
const MARQUEE_MIN = 5;
/** Each half of the scrolling track holds at least this many tiles, so it is wider than the screen. */
const TILES_PER_HALF = 10;

async function getPartners(): Promise<Partner[]> {
  try {
    const r = await api<{ data: Partner[] }>('/lenders', { next: { revalidate: 3600, tags: ['lenders'] } });
    return r.data
      .filter((l) => l.showOnHome)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function Tile({ p, hidden }: { p: Partner; hidden?: boolean }) {
  return (
    <li
      aria-hidden={hidden || undefined}
      className={`flex h-[72px] w-[168px] flex-none snap-start items-center justify-center rounded-[20px] bg-white px-5 ${hidden ? 'marquee-copy' : ''}`}
    >
      {p.logoPath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={browserApiUrl(p.logoPath)}
          alt={hidden ? '' : p.name}
          title={p.name}
          loading="lazy"
          decoding="async"
          className="max-h-9 max-w-[124px] object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
        />
      ) : (
        <span className="text-center font-display text-[15px] font-bold leading-tight text-muted">
          {p.name}
        </span>
      )}
    </li>
  );
}

export async function PartnerBanks() {
  const partners = await getPartners();
  if (!partners.length) return null;
  const scrolling = partners.length >= MARQUEE_MIN;
  const copies = scrolling ? 2 * Math.ceil(TILES_PER_HALF / partners.length) : 1;

  return (
    <section aria-labelledby="partners-h" className="bg-surface">
      <div className="container-site flex flex-col gap-6 py-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="partners-h"
            className="m-0 font-display text-[22px] font-bold tracking-[-0.4px] sm:text-[26px]"
          >
            Our lending partners
          </h2>
          <Link href="/lending-partners" className="text-sm font-bold">
            See all partners
          </Link>
        </div>
        {scrolling ? (
          <div className="marquee overflow-hidden">
            <ul className="marquee-track m-0 flex list-none gap-3.5 p-0">
              {Array.from({ length: copies }, (_, c) =>
                partners.map((p) => <Tile key={`${c}-${p.id}`} p={p} hidden={c > 0} />),
              ).flat()}
            </ul>
          </div>
        ) : (
          <ul className="m-0 flex list-none snap-x gap-3.5 overflow-x-auto p-0 sm:flex-wrap sm:overflow-visible">
            {partners.map((p) => (
              <Tile key={p.id} p={p} />
            ))}
          </ul>
        )}
        <p className="m-0 text-[13px] text-muted">
          DeepFinServ is a loan distributor, not a lender. Each partner decides on your loan under its own
          policy.
        </p>
      </div>
    </section>
  );
}
