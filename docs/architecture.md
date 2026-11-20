# Architecture

```
Browser ──HTTPS──> Nginx (EC2) ──/api/*──> Express API (PM2, 2 workers) ──TLS──> RDS PostgreSQL
                         └──────/*──────> Next.js standalone (PM2)
```

Nginx routes `/api/` to the API and everything else to Next, so the browser sees one origin. That keeps
the staff session cookie `SameSite=Strict` and removes CORS from production. In local development Next
proxies `/api/v1` to the API through a rewrite for the same reason.

## Rendering

Marketing pages are server components rendered at build time and revalidated: home and product pages every
5 minutes (to pick up starting rates from `GET /products`), lending partners hourly. If the API is down
during a build or revalidation, pages fall back to the indicative rates in the catalogue rather than failing.
Interactive parts (loan matcher, calculators, forms, the apply flow, the admin area) are client components.

`/apply` renders client-only because it reads the hand-off from the home matcher out of `sessionStorage`.
The mobile number never appears in a URL.

## Shared package

`packages/shared` is consumed as TypeScript source by both apps. It holds:

- Zod request schemas. The frontend forms and the API validate with the same rules and messages.
- The product catalogue (copy, ranges, FAQs). Product content lives in code, reviewed in pull requests,
  rather than in a CMS table. The backend seeds the `products` table from it.
- Finance maths (EMI, eligibility, balance transfer, prepayment) used by the calculators and the offer rule.
- The offer rule `computeOffers` (version `v1`).

## Offer rule v1

For each active rate card of the requested product: the person's income must meet the card minimum and the
tenure must fall within the card's range. The offered amount is the lowest of the amount asked, the card's
maximum, and what 50% of income (or the card's FOIR cap) can service at the card's starting APR. Offers
under 25% of the amount asked are dropped. "Best match" is the lowest APR among offers for the full amount.
Every offer carries a plain reason. There is no paid placement and no hidden weighting, which is what the
RBI Digital Lending Directions expect of an aggregator.

Offers are computed once per lead and frozen in `offer_snapshots`, so DeepFinServ can show what a person was offered
even after a rate card changes.

## Flows

Apply: loan request → OTP → `POST /leads` (consumes the verification, records contact consent) → offers →
details → `POST /applications` (records bureau consent, encrypts PII) → reference number.

Credit score: details + OTP → `POST /credit-score/requests` → advisor queue. No score is shown until a
bureau is integrated.

Callback, partner and grievance forms write straight to their staff queues.

## Known limits

- Credit cards have no rate-card model yet (limits, fees and rewards differ from loans). The card product
  page and callback work; the offer step will show no match for cards until that model exists.
- Document upload is not built. Staff collect documents after the first call.
- One API region, one database. Fine for this traffic; revisit before national campaigns.
