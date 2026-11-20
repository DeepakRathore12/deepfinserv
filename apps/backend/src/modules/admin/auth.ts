import argon2 from 'argon2';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db';
import { env } from '../../config/env';
import { requireStaff, SESSION_COOKIE } from '../../middlewares/auth';
import { loginLimiter } from '../../middlewares/rate-limit';
import { validate } from '../../middlewares/validate';
import { lookupHash, sessionId } from '../../utils/crypto';
import { AppError } from '../../utils/errors';
import { audit } from './audit';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});
const LOCK_AFTER = 5;
const LOCK_MINUTES = 15;
// Verifying against a fixed hash when the user does not exist keeps response time uniform.
const DUMMY_HASH = argon2.hash('not-a-real-password', { type: argon2.argon2id });

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;
  const user = await db('staff_users').where({ email }).first();
  const fail = new AppError(401, 'invalid_login', 'Email or password is not right');
  if (!user || !user.active) {
    await argon2.verify(await DUMMY_HASH, password);
    throw fail;
  }
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    throw new AppError(423, 'locked', `Too many failed attempts. Try again after ${LOCK_MINUTES} minutes.`);
  }
  if (!(await argon2.verify(user.password_hash, password))) {
    const failed = user.failed_logins + 1;
    await db('staff_users')
      .where({ id: user.id })
      .update({
        failed_logins: failed >= LOCK_AFTER ? 0 : failed,
        locked_until: failed >= LOCK_AFTER ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      });
    throw fail;
  }
  const sid = sessionId();
  const ttl = env.SESSION_TTL_HOURS * 3600_000;
  await db('staff_sessions').insert({
    id_hash: lookupHash(sid),
    staff_id: user.id,
    expires_at: new Date(Date.now() + ttl),
    ip_hash: lookupHash(req.ip ?? ''),
  });
  await db('staff_users')
    .where({ id: user.id })
    .update({ failed_logins: 0, locked_until: null, last_login_at: db.fn.now() });
  await db('staff_sessions').where('expires_at', '<', db.fn.now()).del();
  await audit(user.id, 'login', 'staff_user', user.id);
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: env.COOKIE_SECURE === 'true',
    sameSite: 'strict',
    maxAge: ttl,
    path: '/',
  });
  res.json({ staff: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

authRouter.post('/logout', requireStaff, async (req, res) => {
  const sid = (req.cookies as Record<string, string>)[SESSION_COOKIE];
  if (sid)
    await db('staff_sessions')
      .where({ id_hash: lookupHash(sid) })
      .del();
  res.clearCookie(SESSION_COOKIE, { path: '/' }).status(204).end();
});

authRouter.get('/me', requireStaff, (_req, res) => {
  res.json({ staff: res.locals.staff });
});
