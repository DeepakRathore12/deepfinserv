import Link from 'next/link';

export function Logo({ size = 38 }: { size?: number }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-ink no-underline hover:text-ink"
      aria-label="DeepFinServ home"
    >
      <svg aria-hidden="true" width={size} height={size} viewBox="0 0 38 38">
        <rect width="38" height="38" rx="11" fill="#2B3A9A" />
        <path
          d="M13 10h5.5a9 9 0 0 1 0 18H13z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        <circle cx="18.5" cy="19" r="2.4" fill="#F5A524" />
      </svg>
      <span className="font-display text-[21px] font-extrabold tracking-[-0.5px]">DeepFinServ</span>
    </Link>
  );
}
