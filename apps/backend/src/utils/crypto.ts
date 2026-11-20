import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from 'node:crypto';
import { env } from '../config/env';

const encKey = Buffer.from(env.DATA_ENCRYPTION_KEY, 'base64');
const pepper = Buffer.from(env.HASH_PEPPER, 'base64');
const tokenKey = Buffer.from(env.TOKEN_SECRET, 'base64');

/** AES-256-GCM. Output: base64(iv | tag | ciphertext). */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', encKey, iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64');
}

export function decrypt(blob: string): string {
  const b = Buffer.from(blob, 'base64');
  const d = createDecipheriv('aes-256-gcm', encKey, b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString('utf8');
}

/** Keyed hash for lookups (mobile, PAN) without storing them in plain text. */
export const lookupHash = (value: string): string => createHmac('sha256', pepper).update(value).digest('hex');

/** Six-digit one-time code. */
export const otpCode = (): string => String(randomInt(0, 1_000_000)).padStart(6, '0');

export function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, 'hex');
  const y = Buffer.from(b, 'hex');
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Compact signed token: base64url(payload).base64url(hmac). Payload carries `exp` in seconds. */
export function signToken(payload: Record<string, unknown>, ttlSeconds: number): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }),
  ).toString('base64url');
  const sig = createHmac('sha256', tokenKey).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken<T extends Record<string, unknown>>(token: string): T | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', tokenKey).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T & { exp: number };
    return p.exp > Date.now() / 1000 ? p : null;
  } catch {
    return null;
  }
}

/** Human-friendly unique references: DK26 + 8 base32 characters (no 0, O, 1, I). */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function reference(prefix: string): string {
  const yy = String(new Date().getFullYear()).slice(2);
  let s = '';
  for (let i = 0; i < 8; i += 1) s += ALPHABET[randomInt(0, ALPHABET.length)];
  return `${prefix}${yy}${s}`;
}

export const sessionId = (): string => randomBytes(32).toString('base64url');
export const maskMobile = (m: string): string => `XXXXXX${m.slice(-4)}`;
