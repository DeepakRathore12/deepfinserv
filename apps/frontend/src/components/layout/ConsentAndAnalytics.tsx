'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';

const KEY = 'dk-analytics-consent';
const EVENT = 'dk-consent';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

type Choice = 'yes' | 'no' | 'unset' | 'server';

function read(): Choice {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'yes' || v === 'no' ? v : 'unset';
  } catch {
    return 'unset';
  }
}
function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
}
function save(v: 'yes' | 'no') {
  try {
    window.localStorage.setItem(KEY, v);
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Loads Google Tag Manager only after the visitor accepts analytics cookies. */
export function ConsentAndAnalytics() {
  const choice = useSyncExternalStore<Choice>(subscribe, read, () => 'server');
  if (!GTM_ID) return null;
  return (
    <>
      {choice === 'yes' ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      ) : null}
      {choice === 'unset' ? (
        <div
          role="dialog"
          aria-label="Cookie preferences"
          className="fixed inset-x-3 bottom-3 z-30 mx-auto flex max-w-[720px] flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white p-4 text-sm text-ink shadow-[0_20px_50px_-20px_rgba(18,22,51,.35)] max-[720px]:bottom-20"
        >
          <p className="m-0 max-w-[440px] text-muted">
            We use analytics cookies to understand which pages help people most. No personal details are
            shared.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost min-h-11 px-4 text-sm" onClick={() => save('no')}>
              Decline
            </button>
            <button
              type="button"
              className="btn btn-primary min-h-11 px-4 text-sm"
              onClick={() => save('yes')}
            >
              Accept
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
