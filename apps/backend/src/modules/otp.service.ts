import { db } from '../config/db';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { decrypt, encrypt, lookupHash, otpCode, safeEqualHex, signToken, verifyToken } from '../utils/crypto';
import { AppError, tooMany, unauthorized } from '../utils/errors';

export type OtpPurpose = 'apply' | 'score' | 'callback';

const CODE_TTL = 5 * 60;
const RESEND_AFTER = 30;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_HOUR = 5;
const VERIFICATION_TTL = 15 * 60;
/** Fixed code while no SMS is sent. Console delivery is refused in production by env.ts. */
const DEV_FIXED_CODE = '123456';

/** Delivery is pluggable. "console" is for local development only and is refused in production by env.ts. */
async function deliver(mobile: string, code: string): Promise<void> {
  if (env.OTP_PROVIDER === 'console') {
    logger.warn({ otp: code, to: `XXXXXX${mobile.slice(-4)}` }, 'development OTP (not sent)');
    return;
  }
  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authkey: env.MSG91_AUTH_KEY! },
    body: JSON.stringify({ template_id: env.MSG91_TEMPLATE_ID, mobile: `91${mobile}`, otp: code }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    logger.error({ status: res.status }, 'OTP provider rejected the request');
    throw new AppError(
      502,
      'otp_failed',
      'We could not send the code right now. Please try again in a minute.',
    );
  }
}

export async function sendOtp(mobile: string, purpose: OtpPurpose, ip: string) {
  const mobileHash = lookupHash(mobile);
  const recent = await db('otp_challenges')
    .where({ mobile_hash: mobileHash })
    .andWhere('created_at', '>', db.raw("now() - interval '1 hour'"))
    .orderBy('created_at', 'desc')
    .select('created_at');
  if (recent.length >= MAX_SENDS_PER_HOUR)
    throw tooMany('Too many codes requested for this number. Please try again in an hour.');
  const last = recent[0] as { created_at: Date } | undefined;
  if (last && Date.now() - new Date(last.created_at).getTime() < RESEND_AFTER * 1000) {
    throw tooMany('Please wait 30 seconds before asking for another code.');
  }
  const code = env.OTP_PROVIDER === 'console' ? DEV_FIXED_CODE : otpCode();
  const [row] = await db('otp_challenges')
    .insert({
      mobile_hash: mobileHash,
      mobile_enc: encrypt(mobile),
      purpose,
      code_hash: lookupHash(code),
      expires_at: new Date(Date.now() + CODE_TTL * 1000),
      ip_hash: lookupHash(ip),
    })
    .returning('id');
  await deliver(mobile, code);
  return {
    challengeId: (row as { id: string }).id,
    resendAfter: RESEND_AFTER,
    devCode: env.NODE_ENV === 'test' || env.OTP_ECHO === 'true' ? code : undefined,
  };
}

export async function verifyOtp(challengeId: string, code: string) {
  // The wrong-attempt counter must be committed even though the request fails, so the
  // transaction returns an outcome and errors are thrown only after it commits.
  const outcome = await db.transaction(async (trx) => {
    const c = await trx('otp_challenges').where({ id: challengeId }).forUpdate().first();
    if (!c || c.consumed_at) return { kind: 'invalid' as const };
    if (new Date(c.expires_at).getTime() < Date.now()) return { kind: 'expired' as const };
    if (c.attempts >= MAX_ATTEMPTS) return { kind: 'locked' as const };
    if (!safeEqualHex(c.code_hash, lookupHash(code))) {
      await trx('otp_challenges').where({ id: challengeId }).increment('attempts', 1);
      return { kind: 'wrong' as const, left: MAX_ATTEMPTS - c.attempts - 1 };
    }
    await trx('otp_challenges').where({ id: challengeId }).update({ verified_at: trx.fn.now() });
    return { kind: 'ok' as const, purpose: c.purpose as OtpPurpose };
  });
  switch (outcome.kind) {
    case 'ok':
      return {
        verificationToken: signToken({ t: 'otp', cid: challengeId, p: outcome.purpose }, VERIFICATION_TTL),
      };
    case 'wrong':
      throw new AppError(
        400,
        'otp_wrong',
        outcome.left > 0
          ? `That code is not right. ${outcome.left} ${outcome.left === 1 ? 'try' : 'tries'} left.`
          : 'Too many wrong attempts. Please request a new code.',
      );
    case 'locked':
      throw tooMany('Too many wrong attempts. Please request a new code.');
    default:
      throw new AppError(400, `otp_${outcome.kind}`, 'That code has expired. Please request a new one.');
  }
}

/**
 * Exchange a verification token for the verified mobile, once. The token names the challenge;
 * the mobile itself never travels in the token.
 */
export async function consumeVerification(token: string, purpose: OtpPurpose, trx = db) {
  const p = verifyToken<{ t: string; cid: string; p: string }>(token);
  if (!p || p.t !== 'otp' || p.p !== purpose)
    throw unauthorized('Your mobile verification has expired. Please verify again.');
  const updated = await trx('otp_challenges')
    .where({ id: p.cid })
    .whereNotNull('verified_at')
    .whereNull('consumed_at')
    .update({ consumed_at: trx.fn.now() })
    .returning(['mobile_enc', 'mobile_hash']);
  const row = updated[0] as { mobile_enc: string; mobile_hash: string } | undefined;
  if (!row) throw unauthorized('Your mobile verification has expired. Please verify again.');
  return { mobile: decrypt(row.mobile_enc), mobileHash: row.mobile_hash };
}
