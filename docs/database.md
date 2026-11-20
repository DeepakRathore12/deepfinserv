# Database

PostgreSQL 16. Migrations are TypeScript files in `apps/backend/src/database/migrations`, listed in
`migrations/index.ts` so the bundled server can run them without the source tree. Never edit a migration
that has run in production; add a new one.

```
pnpm --filter @dk/backend migrate | migrate:rollback | migrate:status | seed [--samples]
```

## Tables (17)

| Table                   | Holds                                                                                             | Personal data                             |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `products`              | The nine products, seeded from the catalogue                                                      |                                           |
| `lenders`               | Lending partners, logo, home page visibility and order; `is_sample` rows are hidden in production |                                           |
| `rate_cards`            | Dated APR, fee, income, amount and tenure limits, FOIR cap, KFS link                              |                                           |
| `otp_challenges`        | Code hash, attempts, expiry, verified and consumed times                                          | mobile encrypted + HMAC                   |
| `customers`             | One row per verified mobile                                                                       | mobile encrypted + HMAC                   |
| `consents`              | Purpose, wording version, source, time, IP hash                                                   |                                           |
| `leads`                 | Product, amount, tenure, employment, income, status, owner, UTM                                   |                                           |
| `offer_snapshots`       | The offers a lead was shown, frozen                                                               |                                           |
| `applications`          | Reference, chosen offer, employer, pincode, city                                                  | name, DOB, PAN, email encrypted; PAN HMAC |
| `lead_notes`            | Status changes and call notes                                                                     |                                           |
| `credit_score_requests` | Reference, provider, status                                                                       | name, PAN encrypted                       |
| `callbacks`             | Name, product, city, time slot, status                                                            | mobile encrypted                          |
| `partner_applications`  | Name, city, profession, experience, status                                                        | mobile, email encrypted                   |
| `grievances`            | Ticket, category, message, 30-day due date, resolution                                            | mobile encrypted                          |
| `staff_users`           | Email, name, argon2id hash, role, lockout                                                         |                                           |
| `staff_sessions`        | Session id hash, expiry                                                                           |                                           |
| `audit_log`             | Staff logins, record views, updates and exports                                                   |                                           |

Amounts are whole rupees in `bigint`. Times are `timestamptz`.

## Retention

Not automated yet. Recommended policy for counsel to confirm: delete OTP challenges after 30 days, leads that
never became applications after 12 months, and applications per the lender agreement and the PMLA record
rules. A nightly job can do this once the policy is signed off.

## Backups

RDS automated backups with 14-day retention and point-in-time recovery; a manual snapshot before each
release that contains a migration.
