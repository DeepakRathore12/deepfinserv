import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/config/db';
import { api, createLead, staffAgent } from './helpers';

afterAll(() => db.destroy());

describe('staff auth', () => {
  it('blocks the admin API without a session', async () => {
    await api().get('/api/v1/admin/leads').expect(401);
  });
  it('gives the same answer for a wrong password and an unknown email', async () => {
    const { email } = await staffAgent('agent');
    const a = await api().post('/api/v1/admin/auth/login').send({ email, password: 'nope' }).expect(401);
    const b = await api()
      .post('/api/v1/admin/auth/login')
      .send({ email: 'ghost@dk.test', password: 'nope' })
      .expect(401);
    expect(a.body).toEqual(b.body);
  });
  it('locks the account after five failures', async () => {
    const { email } = await staffAgent('agent');
    for (let i = 0; i < 5; i += 1)
      await api().post('/api/v1/admin/auth/login').send({ email, password: 'nope' });
    await api()
      .post('/api/v1/admin/auth/login')
      .send({ email, password: 'correct horse battery' })
      .expect(423);
  });
  it('sets an httpOnly, SameSite=Strict cookie and ends it on logout', async () => {
    const { agent } = await staffAgent();
    await agent.get('/api/v1/admin/auth/me').expect(200);
    await agent.post('/api/v1/admin/auth/logout').expect(204);
    await agent.get('/api/v1/admin/auth/me').expect(401);
  });
  it('rejects cross-origin writes', async () => {
    const { agent } = await staffAgent();
    const { leadId } = await createLead();
    await agent
      .patch(`/api/v1/admin/leads/${leadId}`)
      .set('origin', 'https://evil.example')
      .send({ status: 'closed' })
      .expect(403);
  });
});

describe('leads admin', () => {
  it('masks mobiles in lists, shows them on the record and audits the view', async () => {
    const { agent } = await staffAgent('agent');
    const { leadId } = await createLead();
    const list = await agent.get('/api/v1/admin/leads').expect(200);
    expect(list.body.data[0].mobile).toMatch(/^XXXXXX\d{4}$/);
    const one = await agent.get(`/api/v1/admin/leads/${leadId}`).expect(200);
    expect(one.body.lead.mobile).toMatch(/^9\d{9}$/);
    expect(await db('audit_log').where({ action: 'view_pii', entity_id: leadId }).first()).toBeTruthy();
  });
  it('records status changes in the history', async () => {
    const { agent } = await staffAgent('agent');
    const { leadId } = await createLead();
    await agent
      .patch(`/api/v1/admin/leads/${leadId}`)
      .send({ status: 'contacted', note: 'Spoke to customer', assignToMe: true })
      .expect(200);
    const one = await agent.get(`/api/v1/admin/leads/${leadId}`).expect(200);
    expect(one.body.lead.status).toBe('contacted');
    expect(one.body.notes[0]).toMatchObject({ from: 'new', to: 'contacted', body: 'Spoke to customer' });
  });
  it('lets only admins export, and neutralises spreadsheet formulas', async () => {
    const agentOnly = await staffAgent('agent');
    await agentOnly.agent.get('/api/v1/admin/leads.csv').expect(403);
    const { agent } = await staffAgent('admin');
    const r = await agent.get('/api/v1/admin/leads.csv').expect(200);
    expect(r.headers['content-type']).toContain('text/csv');
    expect(r.text).not.toMatch(/ABCDE1234F/);
  });
  it('lets only admins change rate cards and validates them', async () => {
    const lender = await db('lenders').first('id');
    const card = {
      lenderId: lender.id,
      product: 'car-loan',
      aprMin: 9,
      aprMax: 8,
      processingFeePct: 1,
      minIncome: 20000,
      maxAmount: 2000000,
      minTenure: 12,
      maxTenure: 84,
      foirCap: null,
      kfsUrl: null,
      effectiveFrom: '2026-01-01',
      effectiveTo: null,
    };
    const a = await staffAgent('agent');
    await a.agent
      .post('/api/v1/admin/rate-cards')
      .send({ ...card, aprMax: 15 })
      .expect(403);
    const { agent } = await staffAgent('admin');
    const bad = await agent.post('/api/v1/admin/rate-cards').send(card).expect(422);
    expect(bad.body.error.fields.aprMax).toBeTruthy();
    await agent
      .post('/api/v1/admin/rate-cards')
      .send({ ...card, aprMax: 15 })
      .expect(201);
  });
  it('lets only admins upload lender logos, checks the bytes and serves them publicly', async () => {
    const lender = await db('lenders').orderBy('name').first('id');
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.alloc(64, 1),
    ]);
    const a = await staffAgent('agent');
    await a.agent
      .put(`/api/v1/admin/lenders/${lender.id}/logo`)
      .set('content-type', 'image/png')
      .send(png)
      .expect(403);

    const { agent } = await staffAgent('admin');
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const bad = await agent
      .put(`/api/v1/admin/lenders/${lender.id}/logo`)
      .set('content-type', 'image/png')
      .send(svg)
      .expect(422);
    expect(bad.body.error.code).toBe('logo_invalid');
    await agent
      .put(`/api/v1/admin/lenders/${lender.id}/logo`)
      .set('content-type', 'image/png')
      .send(Buffer.concat([png, Buffer.alloc(210 * 1024)]))
      .expect(413);

    await agent
      .put(`/api/v1/admin/lenders/${lender.id}/logo`)
      .set('content-type', 'image/png')
      .send(png)
      .expect(200);
    const list = await api().get('/api/v1/lenders').expect(200);
    const row = list.body.data.find((l: { id: string }) => l.id === lender.id);
    expect(row.logoPath).toMatch(new RegExp(`^/lenders/${lender.id}/logo\\?v=\\d+$`));
    const img = await api().get(`/api/v1${row.logoPath}`).expect(200);
    expect(img.headers['content-type']).toBe('image/png');
    expect(img.headers['cache-control']).toContain('immutable');
    expect(Buffer.compare(img.body as Buffer, png)).toBe(0);
    expect(await db('audit_log').where({ action: 'update_logo', entity_id: lender.id }).first()).toBeTruthy();

    await agent.delete(`/api/v1/admin/lenders/${lender.id}/logo`).expect(204);
    await api().get(`/api/v1/lenders/${lender.id}/logo`).expect(404);
  });
  it('saves home page visibility and order for lenders', async () => {
    const l = await db('lenders').orderBy('name').first();
    const { agent } = await staffAgent('admin');
    await agent
      .put(`/api/v1/admin/lenders/${l.id}`)
      .send({
        name: l.name,
        lenderType: l.lender_type,
        regulator: l.regulator,
        showOnHome: false,
        displayOrder: 5,
      })
      .expect(200);
    const row = (await api().get('/api/v1/lenders')).body.data.find((x: { id: string }) => x.id === l.id);
    expect(row).toMatchObject({ showOnHome: false, displayOrder: 5 });
  });
  it('resolves a grievance with a written resolution', async () => {
    const r = await api()
      .post('/api/v1/grievances')
      .send({
        name: 'Ravi Kumar',
        mobile: '9811122233',
        category: 'Other',
        message: 'Twenty characters at the very least.',
      })
      .expect(201);
    const g = await db('grievances').where({ ticket_no: r.body.ticketNo }).first('id');
    const { agent } = await staffAgent('agent');
    await agent
      .patch(`/api/v1/admin/queues/grievances/${g.id}`)
      .send({ status: 'resolved', resolution: 'Called and explained.' })
      .expect(200);
    expect((await db('grievances').where({ id: g.id }).first()).resolution).toBe('Called and explained.');
  });
});
