import type React from 'react';
import { SiteFooter } from './SiteFooter';
import { Breadcrumbs } from '../ui/Breadcrumbs';

/** Simple text page in the site's style, for legal and company pages. */
export function ProsePage({
  title,
  intro,
  path,
  children,
}: {
  title: string;
  intro?: string;
  path: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="bg-surface">
        <div className="container-site flex flex-col gap-3 sm:gap-4 pt-8 sm:pt-14 pb-8 sm:pb-12">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: title, path },
            ]}
          />
          <h1 className="a-up m-0 max-w-[820px] font-display text-[clamp(26px,4.6vw,52px)] leading-[1.05] sm:leading-none font-extrabold tracking-[-1.2px] sm:tracking-[-1.6px]">
            {title}
          </h1>
          {intro ? <p className="m-0 max-w-[680px] text-base sm:text-[17px] leading-relaxed text-muted">{intro}</p> : null}
        </div>
      </section>
      <section>
        <div className="container-site py-8 sm:py-14">
          <div className="prose-dk max-w-[760px] text-[15.5px] leading-[1.7] text-[#3B4060] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[24px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.5px] [&_h2]:text-ink [&_li]:mb-1.5 [&_p]:mb-4 [&_ul]:pl-5">
            {children}
          </div>
        </div>
      </section>
      <SiteFooter withCta={false} />
    </>
  );
}

/** Marks text that must be replaced by reviewed legal copy before launch. Visible in development only. */
export function LegalDraftNotice() {
  return (
    <p className="rounded-[14px] bg-cream px-4 py-3 text-sm font-semibold text-[#8A5400]">
      Draft for legal review. Replace with text approved by your counsel before launch.
    </p>
  );
}
