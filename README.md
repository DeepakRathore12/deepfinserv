# DeepFinServ

Lead generation and loan comparison site for DeepFinServ, a Direct Selling Agent. People Get Loans
from partner lenders, verify their mobile, see offers ranked by APR and apply. Staff work the leads in a
private admin area.

```
apps/frontend   Next.js 16 (App Router, RSC), Tailwind 4, React Hook Form + Zod
apps/backend    Express 5, PostgreSQL 16 via Knex, argon2, pino
packages/shared Zod schemas, product catalogue, finance maths and the offer rule (used by both apps)
infra           Dockerfiles, Nginx, deploy scripts        .github/workflows  CI and deploy
```

## Run it locally

Needs Node 22, pnpm 10 and PostgreSQL 16.

```bash
pnpm install
createdb dk_finance && createdb dk_test         # or use docker compose (below)
cp apps/backend/.env.example apps/backend/.env  # then fill the three keys:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
pnpm --filter @dk/backend migrate
pnpm --filter @dk/backend seed --samples        # products + clearly labelled sample lenders
pnpm --filter @dk/backend staff:create you@deepfinserv.in "Your Name" admin
pnpm dev                                         # web on :3000, API on :4000 (proxied at /api/v1)
```

OTP codes are printed in the API log in development (`OTP_PROVIDER=console`). Staff sign in at `/admin`.

Full stack in containers: `docker compose up --build`, then run the migrate and seed commands shown at the
top of `docker-compose.yml`. The site is on http://localhost:8080.

## Checks

| Command                           | What it runs                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm -r typecheck`               | TypeScript in every package                                                                                                                   |
| `pnpm --filter @dk/frontend lint` | ESLint (Next, React hooks, jsx-a11y)                                                                                                          |
| `pnpm -r test`                    | Vitest: shared maths (12), backend API against a real database (29), frontend helpers and SEO (5)                                             |
| `pnpm --filter @dk/frontend e2e`  | Playwright: apply, credit score and callback flows on desktop and mobile. Needs both servers running and the API started with `OTP_ECHO=true` |
| `pnpm -r build`                   | Next standalone build and the bundled API                                                                                                     |

## Before launch

These are business inputs the code cannot invent. The site shows visible placeholders until they are filled.

1. Lending partners and rate cards: add each lender DeepFinServ has a signed agreement with, and its rate cards with
   the Key Fact Statement link, in `/admin/lenders` and `/admin/rate-cards`. Sample lenders are hidden in
   production automatically, so with no real cards the offer step shows "no match" and invites a call.
2. Business details in `apps/frontend/src/lib/site.ts`: toll-free number, WhatsApp, address, and the named
   grievance officer (an RBI requirement).
3. Legal pages: `/privacy` and `/terms` carry a draft notice. Have counsel review them, then remove
   `LegalDraftNotice`.
4. SMS: a DLT-registered sender and template with MSG91, then `OTP_PROVIDER=msg91`.
5. Credit bureau: with `BUREAU_PROVIDER=none` every score request goes to an advisor queue. An instant score
   needs a bureau contract (CIBIL, Experian, Equifax or CRIF) and an adapter in `modules/public/routes.ts`.
6. Analytics IDs and Search Console verification as build variables (see `docs/seo-analytics.md`).

More: [architecture](docs/architecture.md), [API](docs/api.md), [database](docs/database.md),
[security and compliance](docs/security.md), [SEO and analytics](docs/seo-analytics.md),
[deployment](docs/deployment.md).
