import { rateLimit, type Options } from 'express-rate-limit';
import { env } from '../config/env';

const base = (o: Partial<Options>) =>
  rateLimit({
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test' || env.OTP_ECHO === 'true',
    handler: (_req, res) =>
      res.status(429).json({
        error: {
          code: 'rate_limited',
          message: 'Too many requests. Please wait a few minutes and try again.',
        },
      }),
    ...o,
  });

/** Broad ceiling for the public API. */
export const apiLimiter = base({ windowMs: 60_000, limit: 120 });
/** Forms that create records. */
export const formLimiter = base({ windowMs: 15 * 60_000, limit: 10 });
/** OTP sends per IP. Per-number limits are enforced in the OTP service against the database. */
export const otpLimiter = base({ windowMs: 15 * 60_000, limit: 6 });
/** Staff login attempts per IP. Per-account lockout is enforced in the auth service. */
export const loginLimiter = base({ windowMs: 15 * 60_000, limit: 10 });
