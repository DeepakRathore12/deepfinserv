# SEO and analytics

## What is in place

- Metadata API on every page: unique title and description, canonical URL, Open Graph.
- JSON-LD: `FinancialService` organisation and `WebSite` on every page, `WebPage` and `BreadcrumbList` per page,
  `Service` on product pages. No `FAQPage` markup: Google limits FAQ rich results to authoritative government
  and health sites, so it adds nothing here.
- `sitemap.xml` lists the 22 indexable URLs. `robots.txt` blocks `/apply`, `/admin` and `/api/`.
- Set `NEXT_PUBLIC_ALLOW_INDEXING=false` on staging builds: pages get `noindex` and `robots.txt` blocks
  everything. Production builds leave it unset or `true`.
- Pages are static or revalidated server components with system-ui fallbacks and `next/font`, so they are
  fast on mid-range Android phones over 4G, which is most of this audience.

## Analytics

Google Tag Manager loads only after the visitor accepts the cookie banner. Set `NEXT_PUBLIC_GTM_ID`, and
configure GA4 inside GTM. The site pushes these events to `dataLayer`:

`loan_matcher_start`, `otp_sent`, `otp_verified`, `lead_created`, `offers_viewed`, `offer_selected`,
`application_submitted`, `score_requested`, `callback_requested`, `partner_applied`, `grievance_submitted`.

No personal data goes into events. Mark `lead_created` and `application_submitted` as conversions in GA4.

Search Console: set `NEXT_PUBLIC_GSC_VERIFICATION` and submit `/sitemap.xml`.

## Content work that moves rankings

The site can rank for "personal loan in <city>" and calculator terms only with real, specific content. Next
steps worth doing: city pages for cities DeepFinServ actually serves (with the local office address, not doorway
pages), lender-specific comparison pages once rate cards are real, and a short guide per product written by
someone who has closed those loans.
