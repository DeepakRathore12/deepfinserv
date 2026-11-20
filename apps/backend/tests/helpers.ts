import argon2 from 'argon2';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/config/db';

export const app = createApp();
export const api = () => request(app);

let n = 0;
/** A unique, valid Indian mobile number per call. */
export const mobile = () => `9${String(Date.now() % 1e8).padStart(8, '0')}${n++ % 10}`;

export async function verifiedToken(purpose: 'apply' | 'score', m = mobile()) {
  const s = await api().post('/api/v1/otp/send').send({ mobile: m, purpose }).expect(201);
  const v = await api()
    .post('/api/v1/otp/verify')
    .send({ challengeId: s.body.challengeId, code: s.body.devCode })
    .expect(200);
  return v.body.verificationToken as string;
}

export const loan = {
  product: 'personal-loan',
  amount: 500000,
  tenureMonths: 36,
  employment: 'salaried',
  monthlyIncome: 80000,
};

export async function createLead() {
  const verificationToken = await verifiedToken('apply');
  const r = await api()
    .post('/api/v1/leads')
    .send({ ...loan, verificationToken, consentContact: true })
    .expect(201);
  return r.body as { leadId: string; leadToken: string };
}

export async function staffAgent(role: 'admin' | 'agent' = 'admin') {
  const email = `${role}-${Date.now()}@dk.test`;
  await db('staff_users').insert({
    email,
    name: `Test ${role}`,
    role,
    password_hash: await argon2.hash('correct horse battery', { type: argon2.argon2id }),
  });
  const agent = request.agent(app);
  await agent.post('/api/v1/admin/auth/login').send({ email, password: 'correct horse battery' }).expect(200);
  return { agent, email };
}
