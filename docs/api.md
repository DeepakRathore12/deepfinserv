# API

Base path `/api/v1`. JSON in and out, 100 KB body limit. Every error has the same shape:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Please check the highlighted fields",
    "fields": { "mobile": "Enter a valid 10-digit mobile number" }
  }
}
```

Request bodies are validated with the schemas in `packages/shared/src/api.ts`.

## Public

| Method and path                               | Auth              | Body or query                                                     | Response                                                                                                                                                     |
| --------------------------------------------- | ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET `/health`                                 |                   |                                                                   | `{status:'ok'}` or 503                                                                                                                                       |
| GET `/products`                               |                   |                                                                   | `{data:[{slug, aprFrom}]}` from live rate cards                                                                                                              |
| GET `/lenders`                                |                   |                                                                   | `{data:[{id, name, lenderType, regulator, website, grievanceContact, logoPath, showOnHome, displayOrder}]}`; `logoPath` is relative to the API base, or null |
| GET `/lenders/:id/logo?v=`                    |                   |                                                                   | The logo image, cached for a year (the `v` changes on each upload)                                                                                           |
| POST `/otp/send`                              |                   | `{mobile, purpose: apply\|score\|callback}`                       | 201 `{challengeId, resendAfter}`                                                                                                                             |
| POST `/otp/verify`                            |                   | `{challengeId, code}`                                             | `{verificationToken}` (15 minutes, single use)                                                                                                               |
| POST `/leads`                                 |                   | loan request + `verificationToken`, `consentContact:true`, `utm?` | 201 `{leadId, leadToken}` (2 hours)                                                                                                                          |
| GET `/leads/:id/offers?sort=apr\|emi\|amount` | Bearer lead token |                                                                   | `{offers:[…], maxEligible, ruleVersion}`                                                                                                                     |
| POST `/applications`                          | Bearer lead token | details + `offerId`, `consentBureau:true`                         | 201 `{referenceNo}`; repeat calls return the same reference                                                                                                  |
| POST `/credit-score/requests`                 |                   | `{fullName, pan, verificationToken, consentBureau:true}`          | 201 `{status:'advisor_review', reference}`                                                                                                                   |
| POST `/callbacks`                             |                   | `{name, mobile, product\|null, city, slot}`                       | 201 `{id}`                                                                                                                                                   |
| POST `/partners`                              |                   | `{name, mobile, email, city, profession, experience}`             | 201 `{id}`                                                                                                                                                   |
| POST `/grievances`                            |                   | `{name, mobile, referenceNo?, category, message}`                 | 201 `{ticketNo}`                                                                                                                                             |

OTP: 6 digits, valid 5 minutes, 5 wrong tries, 30 seconds between sends, 5 sends per number per hour.

## Staff (`/admin`, session cookie)

| Method and path                                            | Role             | Notes                                                                                      |
| ---------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| POST `/admin/auth/login`                                   |                  | `{email, password}`. Locks for 15 minutes after 5 failures                                 |
| POST `/admin/auth/logout`, GET `/admin/auth/me`            | any              |                                                                                            |
| GET `/admin/summary`                                       | any              | Counts for the overview                                                                    |
| GET `/admin/leads?status&product&page`                     | any              | Mobile masked                                                                              |
| GET `/admin/leads/:id`                                     | any              | Decrypted record; the view is audited                                                      |
| PATCH `/admin/leads/:id`                                   | any              | `{status?, note?, assignToMe?}`                                                            |
| GET `/admin/leads.csv`                                     | admin            | No PAN, DOB or full mobile; formulas neutralised; audited                                  |
| GET `/admin/queues/:queue`                                 | any              | `callbacks`, `credit-score`, `grievances`, `partners`; audited                             |
| PATCH `/admin/queues/:queue/:id`                           | any              | `{status, resolution?}`                                                                    |
| GET, POST `/admin/lenders`; PUT `/admin/lenders/:id`       | admin for writes | Body includes `showOnHome` and `displayOrder`                                              |
| PUT, DELETE `/admin/lenders/:id/logo`                      | admin            | Raw PNG, JPEG or WebP body up to 200 KB, type checked from the bytes; SVG refused; audited |
| GET, POST `/admin/rate-cards`; PUT `/admin/rate-cards/:id` | admin for writes |                                                                                            |

Writes from another origin are rejected.

## Rate limits

API: 120 requests a minute per IP. Forms: 10 per 15 minutes. OTP: 6 per 15 minutes. Staff login: 10 per
15 minutes. Nginx adds an edge limit in front of these.
