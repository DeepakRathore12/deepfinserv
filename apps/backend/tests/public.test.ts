import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/config/db';
import { decrypt, signToken } from '../src/utils/crypto';
import { api, createLead, loan, mobile, verifiedToken } from './helpers';

afterAll(() => db.destroy());

describe('health and reference data', () => {
  it('reports healthy', async () => {
    await api().get('/api/v1/health').expect(200, { status: 'ok' });
  });
  it('lists starting APR per product from live rate cards', async () => {
    const r = await api().get('/api/v1/products').expect(200);
    expect(r.body.data.find((p: { slug: string }) => p.slug === 'personal-loan').aprFrom).toBe(10.49);
    expect(r.body.data.some((p: { slug: string }) => p.slug === 'credit-cards')).toBe(false);
  });
  it('lists lenders', async () => {
    const r = await api().get('/api/v1/lenders').expect(200);
    expect(r.body.data.length).toBe(4);
  });
  it('returns the standard error shape for unknown routes', async () => {
    const r = await api().get('/api/v1/nope').expect(404);
    expect(r.body.error.code).toBe('not_found');
  });
});

describe('OTP', () => {
  it('rejects a bad mobile with a field message', async () => {
    const r = await api().post('/api/v1/otp/send').send({ mobile: '12345', purpose: 'apply' }).expect(422);
    expect(r.body.error.fields.mobile).toBeTruthy();
  });
  it('blocks a resend within 30 seconds', async () => {
    const m = mobile();
    await api().post('/api/v1/otp/send').send({ mobile: m, purpose: 'apply' }).expect(201);
    await api().post('/api/v1/otp/send').send({ mobile: m, purpose: 'apply' }).expect(429);
  });
  it('counts wrong codes and locks after five', async () => {
    const s = await api().post('/api/v1/otp/send').send({ mobile: mobile(), purpose: 'apply' }).expect(201);
    const wrong = s.body.devCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i += 1)
      await api()
        .post('/api/v1/otp/verify')
        .send({ challengeId: s.body.challengeId, code: wrong })
        .expect(400);
    await api()
      .post('/api/v1/otp/verify')
      .send({ challengeId: s.body.challengeId, code: s.body.devCode })
      .expect(429);
  });
  it('stores the mobile encrypted, never in plain text', async () => {
    const m = mobile();
    await api().post('/api/v1/otp/send').send({ mobile: m, purpose: 'apply' }).expect(201);
    const row = await db('otp_challenges').orderBy('created_at', 'desc').first();
    expect(JSON.stringify(row)).not.toContain(m);
    expect(decrypt(row.mobile_enc)).toBe(m);
  });
});

describe('leads, offers and applications', () => {
  it('needs a verification token for the right purpose, used once', async () => {
    const scoreToken = await verifiedToken('score');
    await api()
      .post('/api/v1/leads')
      .send({ ...loan, verificationToken: scoreToken, consentContact: true })
      .expect(401);
    const t = await verifiedToken('apply');
    await api()
      .post('/api/v1/leads')
      .send({ ...loan, verificationToken: t, consentContact: true })
      .expect(201);
    await api()
      .post('/api/v1/leads')
      .send({ ...loan, verificationToken: t, consentContact: true })
      .expect(401);
  });

  it('requires contact consent', async () => {
    const t = await verifiedToken('apply');
    const r = await api()
      .post('/api/v1/leads')
      .send({ ...loan, verificationToken: t, consentContact: false })
      .expect(422);
    expect(r.body.error.fields.consentContact).toBe('Tick this box to continue');
  });

  it('rejects a tenure outside the product range', async () => {
    const t = await verifiedToken('apply');
    await api()
      .post('/api/v1/leads')
      .send({ ...loan, tenureMonths: 300, verificationToken: t, consentContact: true })
      .expect(422);
  });

  it('returns ranked offers with one best match, and only to the token holder', async () => {
    const { leadId, leadToken } = await createLead();
    await api().get(`/api/v1/leads/${leadId}/offers`).expect(401);
    const other = await createLead();
    await api()
      .get(`/api/v1/leads/${leadId}/offers`)
      .set('authorization', `Bearer ${other.leadToken}`)
      .expect(403);
    const r = await api()
      .get(`/api/v1/leads/${leadId}/offers?sort=apr`)
      .set('authorization', `Bearer ${leadToken}`)
      .expect(200);
    expect(r.body.offers.length).toBeGreaterThan(0);
    expect(r.body.offers.filter((o: { bestMatch: boolean }) => o.bestMatch)).toHaveLength(1);
    const aprs = r.body.offers.map((o: { apr: number }) => o.apr);
    expect(aprs).toEqual([...aprs].sort((a, b) => a - b));
    expect(r.body.ruleVersion).toBe('v1');
    // Frozen: a second read returns the same snapshot ids.
    const again = await api()
      .get(`/api/v1/leads/${leadId}/offers`)
      .set('authorization', `Bearer ${leadToken}`)
      .expect(200);
    expect(again.body.offers.map((o: { id: string }) => o.id).sort()).toEqual(
      r.body.offers.map((o: { id: string }) => o.id).sort(),
    );
  });

  it('rejects an expired or forged lead token', async () => {
    const { leadId } = await createLead();
    const forged = signToken({ t: 'lead', lid: leadId }, -10);
    await api().get(`/api/v1/leads/${leadId}/offers`).set('authorization', `Bearer ${forged}`).expect(401);
    await api().get(`/api/v1/leads/${leadId}/offers`).set('authorization', 'Bearer abc.def').expect(401);
  });

  it('creates one application per lead, PAN encrypted', async () => {
    const { leadId, leadToken } = await createLead();
    const offers = await api()
      .get(`/api/v1/leads/${leadId}/offers`)
      .set('authorization', `Bearer ${leadToken}`);
    const details = {
      offerId: offers.body.offers[0].id,
      fullName: 'Asha Verma',
      dob: '1990-04-12',
      pan: 'ABCDE1234F',
      email: 'asha@example.com',
      employer: 'Acme',
      pincode: '560001',
      city: 'Bengaluru',
      consentBureau: true,
    };
    const a = await api()
      .post('/api/v1/applications')
      .set('authorization', `Bearer ${leadToken}`)
      .send(details)
      .expect(201);
    expect(a.body.referenceNo).toMatch(/^DK\d{2}[A-Z2-9]{8}$/);
    const b = await api()
      .post('/api/v1/applications')
      .set('authorization', `Bearer ${leadToken}`)
      .send(details)
      .expect(201);
    expect(b.body.referenceNo).toBe(a.body.referenceNo);
    const row = await db('applications').where({ reference_no: a.body.referenceNo }).first();
    expect(JSON.stringify(row)).not.toContain('ABCDE1234F');
    const consents = await db('consents as c')
      .join('leads as l', 'l.customer_id', 'c.customer_id')
      .where('l.id', leadId)
      .pluck('c.purpose');
    expect(consents).toEqual(expect.arrayContaining(['contact', 'bureau']));
  });

  it('refuses an offer that belongs to another lead', async () => {
    const a = await createLead();
    const b = await createLead();
    const offersB = await api()
      .get(`/api/v1/leads/${b.leadId}/offers`)
      .set('authorization', `Bearer ${b.leadToken}`);
    const r = await api()
      .post('/api/v1/applications')
      .set('authorization', `Bearer ${a.leadToken}`)
      .send({
        offerId: offersB.body.offers[0].id,
        fullName: 'Asha Verma',
        dob: '1990-04-12',
        pan: 'ABCDE1234F',
        email: 'a@b.co',
        employer: 'Acme',
        pincode: '560001',
        city: 'Pune',
        consentBureau: true,
      })
      .expect(422);
    expect(r.body.error.code).toBe('offer_invalid');
  });
});

describe('credit score and forms', () => {
  it('books an advisor review and never returns a score without a bureau', async () => {
    const t = await verifiedToken('score');
    const r = await api()
      .post('/api/v1/credit-score/requests')
      .send({ fullName: 'Ravi Kumar', pan: 'ABCDE1234F', verificationToken: t, consentBureau: true })
      .expect(201);
    expect(r.body).toEqual({ status: 'advisor_review', reference: expect.stringMatching(/^CS/) });
  });
  it('saves a callback and silently drops honeypot spam', async () => {
    const before = Number((await db('callbacks').count({ n: '*' }).first())!.n);
    await api()
      .post('/api/v1/callbacks')
      .send({ name: 'Meera Shah', mobile: mobile(), product: null, city: 'Pune', slot: 'evening' })
      .expect(201);
    await api()
      .post('/api/v1/callbacks')
      .send({
        name: 'Spam Bot',
        mobile: mobile(),
        product: null,
        city: 'Pune',
        slot: 'evening',
        website: 'x',
      })
      .expect(422);
    expect(Number((await db('callbacks').count({ n: '*' }).first())!.n)).toBe(before + 1);
  });
  it('opens a grievance with a 30-day due date', async () => {
    const r = await api()
      .post('/api/v1/grievances')
      .send({
        name: 'Ravi Kumar',
        mobile: mobile(),
        category: 'Other',
        message: 'Twenty characters at the very least.',
      })
      .expect(201);
    const g = await db('grievances').where({ ticket_no: r.body.ticketNo }).first();
    const days = (new Date(g.due_at).getTime() - new Date(g.created_at).getTime()) / 86400_000;
    expect(Math.round(days)).toBe(30);
  });
  it('rejects oversized and malformed JSON cleanly', async () => {
    await api().post('/api/v1/callbacks').set('content-type', 'application/json').send('{bad').expect(400);
    await api()
      .post('/api/v1/grievances')
      .send({ message: 'x'.repeat(200_000) })
      .expect(413);
  });
});
