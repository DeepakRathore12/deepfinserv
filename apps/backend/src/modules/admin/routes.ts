import { LENDER_TYPES, PRODUCT_SLUGS } from '@dk/shared';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../config/db';
import { LEAD_STATUSES } from '../../database/migrations/003_leads';
import { QUEUE_STATUSES } from '../../database/migrations/004_requests';
import { requireAdmin, requireStaff } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { decrypt } from '../../utils/crypto';
import { notFound } from '../../utils/errors';
import { audit } from './audit';
import { authRouter } from './auth';

export const adminRouter = Router();
adminRouter.use('/auth', authRouter);
adminRouter.use(requireStaff);
adminRouter.use((_req, res, next) => {
  res.set('cache-control', 'no-store');
  next();
});

const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  status: z.string().optional(),
  product: z.enum(PRODUCT_SLUGS).optional(),
});
const PAGE = 25;

/* ---------- Dashboard ---------- */
adminRouter.get('/summary', async (_req, res) => {
  const count = async (table: string, where: Record<string, unknown>) =>
    Number((await db(table).where(where).count({ n: '*' }).first())?.n ?? 0);
  const today = await db('leads').where('created_at', '>=', db.raw('current_date')).count({ n: '*' }).first();
  res.json({
    leadsNew: await count('leads', { status: 'new' }),
    leadsToday: Number(today?.n ?? 0),
    callbacksOpen: await count('callbacks', { status: 'open' }),
    scoreOpen: await count('credit_score_requests', { status: 'open' }),
    grievancesOpen: Number(
      (await db('grievances').whereIn('status', ['open', 'in_progress']).count({ n: '*' }).first())?.n ?? 0,
    ),
    grievancesOverdue: Number(
      (
        await db('grievances')
          .whereIn('status', ['open', 'in_progress'])
          .andWhere('due_at', '<', db.fn.now())
          .count({ n: '*' })
          .first()
      )?.n ?? 0,
    ),
    partnersOpen: await count('partner_applications', { status: 'open' }),
  });
});

/* ---------- Leads ---------- */
function leadsQuery(q: z.infer<typeof pageQuery>) {
  const b = db('leads as l')
    .join('customers as c', 'c.id', 'l.customer_id')
    .leftJoin('applications as a', 'a.lead_id', 'l.id')
    .leftJoin('staff_users as s', 's.id', 'l.assigned_to');
  if (q.status) b.where('l.status', q.status);
  if (q.product) b.where('l.product_slug', q.product);
  return b;
}

adminRouter.get('/leads', validate(pageQuery, 'query'), async (_req, res) => {
  const q = res.locals.query as z.infer<typeof pageQuery>;
  const total = Number((await leadsQuery(q).count({ n: 'l.id' }).first())?.n ?? 0);
  const rows = await leadsQuery(q)
    .orderBy('l.created_at', 'desc')
    .limit(PAGE)
    .offset((q.page - 1) * PAGE)
    .select(
      'l.id',
      'l.product_slug',
      'l.amount',
      'l.tenure_months',
      'l.employment',
      'l.monthly_income',
      'l.status',
      'l.created_at',
      'c.mobile_enc',
      'a.reference_no',
      's.name as assigned_name',
    );
  res.json({
    total,
    page: q.page,
    pageSize: PAGE,
    data: rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      product: r.product_slug,
      amount: Number(r.amount),
      tenureMonths: r.tenure_months,
      employment: r.employment,
      monthlyIncome: Number(r.monthly_income),
      status: r.status,
      createdAt: r.created_at,
      mobile: decrypt(r.mobile_enc as string),
      referenceNo: r.reference_no ?? null,
      assignedTo: r.assigned_name ?? null,
    })),
  });
});

/** Full lead record. Decrypted fields are shown only here, and every view is audited. */
adminRouter.get('/leads/:id', async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) throw notFound('Lead');
  const l = await db('leads as l')
    .join('customers as c', 'c.id', 'l.customer_id')
    .where('l.id', id.data)
    .first('l.*', 'c.mobile_enc');
  if (!l) throw notFound('Lead');
  const app = await db('applications as a')
    .join('offer_snapshots as o', 'o.id', 'a.offer_id')
    .join('lenders as le', 'le.id', 'o.lender_id')
    .where('a.lead_id', l.id)
    .first('a.*', 'o.apr', 'o.amount as offer_amount', 'o.emi', 'le.name as lender_name');
  const offers = await db('offer_snapshots as o')
    .join('lenders as le', 'le.id', 'o.lender_id')
    .where('o.lead_id', l.id)
    .orderBy('o.apr')
    .select('o.id', 'le.name as lender', 'o.apr', 'o.amount', 'o.emi', 'o.best_match');
  const notes = await db('lead_notes as n')
    .leftJoin('staff_users as s', 's.id', 'n.staff_id')
    .where('n.lead_id', l.id)
    .orderBy('n.created_at', 'desc')
    .select('n.*', 's.name as staff_name');
  const consents = await db('consents')
    .where({ customer_id: l.customer_id })
    .orderBy('granted_at')
    .select('purpose', 'text_version', 'source', 'granted_at');
  await audit(res.locals.staff!.id, 'view_pii', 'lead', l.id);
  res.json({
    lead: {
      id: l.id,
      product: l.product_slug,
      amount: Number(l.amount),
      tenureMonths: l.tenure_months,
      employment: l.employment,
      monthlyIncome: Number(l.monthly_income),
      status: l.status,
      utm: l.utm,
      createdAt: l.created_at,
      mobile: decrypt(l.mobile_enc),
      assignedTo: l.assigned_to,
    },
    application: app
      ? {
          referenceNo: app.reference_no,
          fullName: decrypt(app.full_name_enc),
          dob: decrypt(app.dob_enc),
          pan: decrypt(app.pan_enc),
          email: decrypt(app.email_enc),
          employer: app.employer,
          pincode: app.pincode,
          city: app.city,
          lender: app.lender_name,
          apr: Number(app.apr),
          amount: Number(app.offer_amount),
          emi: Number(app.emi),
          createdAt: app.created_at,
        }
      : null,
    offers: offers.map((o: Record<string, unknown>) => ({
      ...o,
      apr: Number(o.apr),
      amount: Number(o.amount),
    })),
    notes: notes.map((n: Record<string, unknown>) => ({
      id: n.id,
      by: n.staff_name,
      from: n.status_from,
      to: n.status_to,
      body: n.body,
      at: n.created_at,
    })),
    consents,
  });
});

const leadUpdate = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  note: z.string().trim().max(2000).optional(),
  assignToMe: z.boolean().optional(),
});

adminRouter.patch('/leads/:id', validate(leadUpdate), async (req, res) => {
  const b = req.body as z.infer<typeof leadUpdate>;
  const staff = res.locals.staff!;
  const lead = await db('leads').where({ id: req.params.id }).first('id', 'status');
  if (!lead) throw notFound('Lead');
  await db.transaction(async (trx) => {
    const patch: Record<string, unknown> = { updated_at: trx.fn.now() };
    if (b.status && b.status !== lead.status) patch.status = b.status;
    if (b.assignToMe) patch.assigned_to = staff.id;
    await trx('leads').where({ id: lead.id }).update(patch);
    if (patch.status || b.note) {
      await trx('lead_notes').insert({
        lead_id: lead.id,
        staff_id: staff.id,
        status_from: patch.status ? lead.status : null,
        status_to: patch.status ?? null,
        body: b.note || null,
      });
    }
  });
  await audit(staff.id, 'update', 'lead', lead.id, { status: b.status, assigned: b.assignToMe });
  res.json({ ok: true });
});

/** CSV export without PAN, DOB or full mobile. Admin only, audited. */
adminRouter.get('/leads.csv', requireAdmin, validate(pageQuery, 'query'), async (_req, res) => {
  const q = res.locals.query as z.infer<typeof pageQuery>;
  const rows = await leadsQuery(q)
    .orderBy('l.created_at', 'desc')
    .limit(10000)
    .select(
      'l.id',
      'l.created_at',
      'l.product_slug',
      'l.amount',
      'l.tenure_months',
      'l.employment',
      'l.monthly_income',
      'l.status',
      'a.reference_no',
      's.name as assigned_name',
      'c.mobile_enc',
    );
  const esc = (v: unknown) => {
    const s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
    // Neutralise spreadsheet formulas as well as quoting.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const head = [
    'lead_id',
    'created_at',
    'product',
    'amount',
    'tenure_months',
    'employment',
    'monthly_income',
    'status',
    'reference_no',
    'assigned_to',
    'mobile',
  ];
  const lines = rows.map((r: Record<string, unknown>) =>
    [
      r.id,
      r.created_at,
      r.product_slug,
      r.amount,
      r.tenure_months,
      r.employment,
      r.monthly_income,
      r.status,
      r.reference_no,
      r.assigned_name,
      decrypt(r.mobile_enc as string),
    ]
      .map(esc)
      .join(','),
  );
  await audit(res.locals.staff!.id, 'export', 'lead', null, { rows: rows.length, ...q });
  res
    .set('content-type', 'text/csv; charset=utf-8')
    .set('content-disposition', `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`)
    .send([head.join(','), ...lines].join('\n'));
});

/* ---------- Queues: callbacks, credit score requests, partners, grievances ---------- */
type Queue = { table: string; entity: string; columns: string[]; decrypt: string[] };
const QUEUES: Record<string, Queue> = {
  callbacks: {
    table: 'callbacks',
    entity: 'callback',
    columns: ['id', 'name', 'product_slug', 'city', 'slot', 'status', 'created_at'],
    decrypt: ['mobile_enc'],
  },
  'credit-score': {
    table: 'credit_score_requests',
    entity: 'credit_score_request',
    columns: ['id', 'reference_no', 'status', 'created_at'],
    decrypt: ['mobile_enc', 'full_name_enc', 'pan_enc'],
  },
  partners: {
    table: 'partner_applications',
    entity: 'partner',
    columns: ['id', 'name', 'city', 'profession', 'experience', 'status', 'created_at'],
    decrypt: ['mobile_enc', 'email_enc'],
  },
  grievances: {
    table: 'grievances',
    entity: 'grievance',
    columns: [
      'id',
      'ticket_no',
      'name',
      'reference_no',
      'category',
      'message',
      'status',
      'due_at',
      'resolution',
      'created_at',
    ],
    decrypt: ['mobile_enc'],
  },
};

const queueQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  status: z.enum(QUEUE_STATUSES).optional(),
});

adminRouter.get('/queues/:queue', validate(queueQuery, 'query'), async (req, res) => {
  const qd = QUEUES[req.params.queue as string];
  if (!qd) throw notFound('Queue');
  const q = res.locals.query as z.infer<typeof queueQuery>;
  const base = () => {
    const b = db(`${qd.table} as t`);
    if (qd.table === 'credit_score_requests') b.join('customers as c', 'c.id', 't.customer_id');
    if (q.status) b.where('t.status', q.status);
    return b;
  };
  const total = Number((await base().count({ n: '*' }).first())?.n ?? 0);
  const encCols = qd.decrypt.map((c) =>
    c === 'mobile_enc' && qd.table === 'credit_score_requests' ? 'c.mobile_enc' : `t.${c}`,
  );
  const rows = await base()
    .orderBy('t.created_at', 'desc')
    .limit(PAGE)
    .offset((q.page - 1) * PAGE)
    .select([...qd.columns.map((c) => `t.${c}`), ...encCols]);
  const data = rows.map((r: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const c of qd.columns) out[c] = r[c];
    for (const c of qd.decrypt) if (r[c]) out[c.replace(/_enc$/, '')] = decrypt(r[c] as string);
    return out;
  });
  await audit(res.locals.staff!.id, 'view_pii', qd.entity, null, { page: q.page });
  res.json({ total, page: q.page, pageSize: PAGE, data });
});

const queueUpdate = z.object({
  status: z.enum(QUEUE_STATUSES),
  resolution: z.string().trim().max(4000).optional(),
});

adminRouter.patch('/queues/:queue/:id', validate(queueUpdate), async (req, res) => {
  const qd = QUEUES[req.params.queue as string];
  if (!qd) throw notFound('Queue');
  const b = req.body as z.infer<typeof queueUpdate>;
  const patch: Record<string, unknown> = { status: b.status, updated_at: db.fn.now() };
  if (qd.table === 'grievances' && b.resolution !== undefined) patch.resolution = b.resolution;
  const n = await db(qd.table).where({ id: req.params.id }).update(patch);
  if (!n) throw notFound('Record');
  await audit(res.locals.staff!.id, 'update', qd.entity, req.params.id as string, { status: b.status });
  res.json({ ok: true });
});

/* ---------- Lenders and rate cards (admin only) ---------- */
const lenderSchema = z.object({
  name: z.string().trim().min(2).max(120),
  lenderType: z.enum(LENDER_TYPES),
  regulator: z.string().trim().min(2).max(40).default('RBI'),
  website: z.string().trim().url().max(200).nullable().optional(),
  grievanceContact: z.string().trim().max(300).nullable().optional(),
  active: z.boolean().default(true),
});

adminRouter.get('/lenders', async (_req, res) => {
  const rows = await db('lenders').orderBy('name').select('*');
  res.json({
    data: rows.map((l: Record<string, unknown>) => ({
      id: l.id,
      name: l.name,
      lenderType: l.lender_type,
      regulator: l.regulator,
      website: l.website,
      grievanceContact: l.grievance_contact,
      isSample: l.is_sample,
      active: l.active,
    })),
  });
});

const lenderRow = (b: z.infer<typeof lenderSchema>) => ({
  name: b.name,
  lender_type: b.lenderType,
  regulator: b.regulator,
  website: b.website ?? null,
  grievance_contact: b.grievanceContact ?? null,
  active: b.active,
  is_sample: false,
});

adminRouter.post('/lenders', requireAdmin, validate(lenderSchema), async (req, res) => {
  const [row] = await db('lenders').insert(lenderRow(req.body)).returning('id');
  await audit(res.locals.staff!.id, 'create', 'lender', row.id);
  res.status(201).json({ id: row.id });
});

adminRouter.put('/lenders/:id', requireAdmin, validate(lenderSchema), async (req, res) => {
  const n = await db('lenders')
    .where({ id: req.params.id })
    .update({ ...lenderRow(req.body), updated_at: db.fn.now() });
  if (!n) throw notFound('Lender');
  await audit(res.locals.staff!.id, 'update', 'lender', req.params.id as string);
  res.json({ ok: true });
});

const rateCardSchema = z
  .object({
    lenderId: z.string().uuid(),
    product: z.enum(PRODUCT_SLUGS),
    aprMin: z.number().min(0).max(60),
    aprMax: z.number().min(0).max(60),
    processingFeePct: z.number().min(0).max(10),
    minIncome: z.number().int().min(0),
    maxAmount: z.number().int().min(10000),
    minTenure: z.number().int().min(0).max(360),
    maxTenure: z.number().int().min(0).max(360),
    foirCap: z.number().min(0.1).max(0.9).nullable(),
    kfsUrl: z.string().url().max(300).nullable(),
    effectiveFrom: z.string().date(),
    effectiveTo: z.string().date().nullable(),
    active: z.boolean().default(true),
  })
  .refine((v) => v.aprMax >= v.aprMin, { path: ['aprMax'], message: 'Must be at least the minimum APR' })
  .refine((v) => v.maxTenure >= v.minTenure, {
    path: ['maxTenure'],
    message: 'Must be at least the minimum tenure',
  });

const cardRow = (b: z.infer<typeof rateCardSchema>) => ({
  lender_id: b.lenderId,
  product_slug: b.product,
  apr_min: b.aprMin,
  apr_max: b.aprMax,
  processing_fee_pct: b.processingFeePct,
  min_income: b.minIncome,
  max_amount: b.maxAmount,
  min_tenure: b.minTenure,
  max_tenure: b.maxTenure,
  foir_cap: b.foirCap,
  kfs_url: b.kfsUrl,
  effective_from: b.effectiveFrom,
  effective_to: b.effectiveTo,
  active: b.active,
});

adminRouter.get('/rate-cards', async (_req, res) => {
  const rows = await db('rate_cards as r')
    .join('lenders as l', 'l.id', 'r.lender_id')
    .orderBy([{ column: 'r.product_slug' }, { column: 'r.apr_min' }])
    .select('r.*', 'l.name as lender_name');
  res.json({
    data: rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      lenderId: r.lender_id,
      lenderName: r.lender_name,
      product: r.product_slug,
      aprMin: Number(r.apr_min),
      aprMax: Number(r.apr_max),
      processingFeePct: Number(r.processing_fee_pct),
      minIncome: Number(r.min_income),
      maxAmount: Number(r.max_amount),
      minTenure: r.min_tenure,
      maxTenure: r.max_tenure,
      foirCap: r.foir_cap == null ? null : Number(r.foir_cap),
      kfsUrl: r.kfs_url,
      effectiveFrom:
        r.effective_from instanceof Date ? r.effective_from.toISOString().slice(0, 10) : r.effective_from,
      effectiveTo:
        r.effective_to instanceof Date ? r.effective_to.toISOString().slice(0, 10) : r.effective_to,
      active: r.active,
    })),
  });
});

adminRouter.post('/rate-cards', requireAdmin, validate(rateCardSchema), async (req, res) => {
  const [row] = await db('rate_cards').insert(cardRow(req.body)).returning('id');
  await audit(res.locals.staff!.id, 'create', 'rate_card', row.id);
  res.status(201).json({ id: row.id });
});

adminRouter.put('/rate-cards/:id', requireAdmin, validate(rateCardSchema), async (req, res) => {
  const n = await db('rate_cards')
    .where({ id: req.params.id })
    .update({ ...cardRow(req.body), updated_at: db.fn.now() });
  if (!n) throw notFound('Rate card');
  await audit(res.locals.staff!.id, 'update', 'rate_card', req.params.id as string, req.body);
  res.json({ ok: true });
});
