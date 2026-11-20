import type React from 'react';

export function SuccessCard({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className="a-up flex flex-col gap-[18px] rounded-[28px] bg-white p-[clamp(22px,4vw,36px)]"
      role="status"
    >
      <span className="a-pop flex h-14 w-14 items-center justify-center rounded-full bg-mint">
        <svg
          aria-hidden
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0B6E4C"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className="a-draw" pathLength={1} d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <h2 className="m-0 font-display text-[26px] font-extrabold tracking-[-0.6px]">{title}</h2>
      <div className="m-0 text-base leading-relaxed text-muted">{children}</div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}
