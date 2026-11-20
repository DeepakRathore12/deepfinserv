# Security and compliance

## Personal data

- Mobile, PAN, name on applications, date of birth and email are encrypted with AES-256-GCM before they reach
  the database. Mobile and PAN also get an HMAC-SHA256 with a separate pepper so records can be matched
  without decrypting.
- Keys (`DATA_ENCRYPTION_KEY`, `HASH_PEPPER`, `TOKEN_SECRET`) live in SSM Parameter Store as SecureStrings and
  are written to `/etc/dkfinance/*.env` (mode 640) at deploy. Nothing secret is in the repo or the build.
- Logs redact mobile, PAN, codes, tokens, email, names, DOB, auth headers and cookies at the logger.
- Staff see masked mobiles in lists. Opening a record or a queue decrypts it and writes an audit entry.
  CSV export leaves out PAN, DOB and full mobile, and is admin only.
- We collect only what a lender needs to process the chosen loan. No Aadhaar, no bank statements, no
  document uploads in this version.

## Consent (DPDP Act 2023)

Each consent is a row in `consents` with purpose, the version of the wording shown, the source form, time
and an IP hash. Contact consent is taken at the OTP step; bureau consent at application and credit score.
Bump `CONSENT_VERSION` in `customers.service.ts` whenever the wording changes. Withdrawal and erasure
requests are handled by staff for now (see the privacy page); an automated path is a follow-up.

## RBI Digital Lending Directions

- Lending partners page lists every active lender with type, regulator and grievance contact.
- Offers show the lender's name, APR, EMI, processing fee and a KFS link; ranking is by a published rule.
- DeepFinServ is shown as a DSA that does not lend, on every page footer and in the apply flow.
- Grievance form with a ticket number and a 30-day due date tracked in the admin queue; links to the RBI
  Complaint Management System and Sachet in the footer.

## Application security

- Inputs validated with Zod on both sides; body size capped at 100 KB.
- OTP: hashed codes, 5-minute expiry, attempt counter committed even when the request fails, per-number and
  per-IP limits. Verification tokens are single use and carry no personal data.
- Lead tokens are HMAC-signed, expire in 2 hours and only open their own lead.
- Staff: argon2id, lockout after 5 failures, constant-time answer for unknown emails, 12-hour sessions stored
  hashed, cookie `HttpOnly; SameSite=Strict; Secure`, cross-origin writes rejected.
- Helmet on the API, security headers and HSTS on the site, `x-powered-by` off, Nginx edge rate limits.
- The process refuses to start with missing keys, with console OTP in production, or with `OTP_ECHO` in
  production.

## Open items

- Add a WAF (AWS WAF on an ALB, or Cloudflare) before paid campaigns; bots hammer OTP endpoints.
- Staff two-factor sign-in.
- Key rotation procedure (re-encrypt job) once keys need rotating.
