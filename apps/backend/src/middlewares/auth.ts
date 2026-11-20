import type { RequestHandler } from 'express';
import { db } from '../config/db';
import { lookupHash, verifyToken } from '../utils/crypto';
import { AppError, forbidden, unauthorized } from '../utils/errors';

export const LEAD_TOKEN_TTL = 2 * 60 * 60;
export const SESSION_COOKIE = 'dk_staff';

export interface StaffContext {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
}

declare module 'express-serve-static-core' {
  interface Locals {
    leadId?: string;
    staff?: StaffContext;
  }
}

/** Bearer lead token issued when the lead was created. Scopes access to that one lead. */
export const requireLeadToken: RequestHandler = (req, res, next) => {
  const raw = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const p = raw ? verifyToken<{ lid: string; t: string }>(raw) : null;
  if (!p || p.t !== 'lead') return next(unauthorized());
  if (req.params.id && req.params.id !== p.lid) return next(forbidden());
  res.locals.leadId = p.lid;
  next();
};

/** Staff session from an httpOnly cookie; the session id is stored hashed. */
export const requireStaff: RequestHandler = async (req, res, next) => {
  try {
    const sid = (req.cookies as Record<string, string> | undefined)?.[SESSION_COOKIE];
    if (!sid) return next(new AppError(401, 'unauthorized', 'Please sign in'));
    const row = await db('staff_sessions as s')
      .join('staff_users as u', 'u.id', 's.staff_id')
      .where('s.id_hash', lookupHash(sid))
      .andWhere('s.expires_at', '>', db.fn.now())
      .andWhere('u.active', true)
      .first('u.id', 'u.email', 'u.name', 'u.role');
    if (!row) return next(new AppError(401, 'unauthorized', 'Your session has ended. Please sign in again.'));
    res.locals.staff = row as StaffContext;
    next();
  } catch (e) {
    next(e);
  }
};

export const requireAdmin: RequestHandler = (_req, res, next) =>
  res.locals.staff?.role === 'admin' ? next() : next(forbidden());

/**
 * CSRF guard for cookie-authenticated writes. The cookie is SameSite=Strict; this also rejects
 * cross-origin requests whose Origin header does not match an allowed origin.
 */
export function sameOrigin(allowed: string[]): RequestHandler {
  return (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.get('origin');
    if (!origin) return next();
    const self = `${req.protocol}://${req.get('host')}`;
    return origin === self || allowed.includes(origin) ? next() : next(forbidden());
  };
}
