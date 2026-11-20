import {
  callbackSchema,
  createApplicationSchema,
  createLeadSchema,
  creditScoreRequestSchema,
  grievanceSchema,
  offerSortSchema,
  otpSendSchema,
  otpVerifySchema,
  partnerSchema,
  PRODUCT_LIST,
  type CallbackInput,
  type CreateLeadInput,
  type GrievanceInput,
  type PartnerInput,
} from '@dk/shared';
import { Router, type Request } from 'express';
import { z } from 'zod';
import { db } from '../../config/db';
import { env } from '../../config/env';
import { LEAD_TOKEN_TTL, requireLeadToken } from '../../middlewares/auth';
import { formLimiter, otpLimiter } from '../../middlewares/rate-limit';
import { validate } from '../../middlewares/validate';
import { encrypt, lookupHash, reference, signToken } from '../../utils/crypto';
import { AppError, notFound } from '../../utils/errors';
import { recordConsent, upsertCustomer } from '../customers.service';
import { logoPath } from '../lender-logos';
import { offersForLead } from '../offers.service';
import { consumeVerification, sendOtp, verifyOtp } from '../otp.service';

export const publicRouter = Router();
const ip = (req: Request) => req.ip ?? '0.0.0.0';

/** Starting APR per product from live rate cards. Products without cards are omitted; the site falls back to indicative copy. */
publicRouter.get('/products', async (_req, res) => {
  const q = db('rate_cards as r')
    .join('lenders as l', 'l.id', 'r.lender_id')
    .where({ 'r.active': true, 'l.active': true })
    .andWhere('r.effective_from', '<=', db.raw('current_date'))
    .andWhere((w) => w.whereNull('r.effective_to').orWhere('r.effective_to', '>=', db.raw('current_date')))
    .groupBy('r.product_slug')
    .select('r.product_slug as slug', db.raw('min(r.apr_min)::float as "aprFrom"'));
  if (env.NODE_ENV === 'production') q.andWhere('l.is_sample', false);
  const rows = (await q) as { slug: string; aprFrom: number }[];
  const order = PRODUCT_LIST.map((p) => p.slug as string);
  rows.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
  res.set('cache-control', 'public, max-age=60').json({ data: rows });
});

/** Lending partners, as required on the site by the RBI Digital Lending Directions. */
publicRouter.get('/lenders', async (_req, res) => {
  const q = db('lenders')
    .where({ active: true })
    .orderBy('name')
    .select(
      'id',
      'name',
      'lender_type',
      'regulator',
      'website',
      'grievance_contact',
      'logo_updated_at',
      'show_on_home',
      'display_order',
    );
  if (env.NODE_ENV === 'production') q.andWhere({ is_sample: false });
  const rows = (await q) as Record<string, unknown>[];
  res.set('cache-control', 'public, max-age=300').json({
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      lenderType: r.lender_type,
      regulator: r.regulator,
      website: r.website,
      grievanceContact: r.grievance_contact,
      logoPath: logoPath(r.id as string, r.logo_updated_at as Date | null),
      showOnHome: r.show_on_home,
      displayOrder: r.display_order,
    })),
  });
});

publicRouter.get('/lenders/:id/logo', async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) throw notFound('Logo');
  const q = db('lenders')
    .where({ id: id.data, active: true })
    .whereNotNull('logo')
    .first('logo', 'logo_mime');
  if (env.NODE_ENV === 'production') q.andWhere({ is_sample: false });
  const row = (await q) as { logo: Buffer; logo_mime: string } | undefined;
  if (!row) throw notFound('Logo');
  res
    .set('content-type', row.logo_mime)
    .set('cache-control', 'public, max-age=31536000, immutable')
    .send(row.logo);
});

publicRouter.post('/otp/send', otpLimiter, validate(otpSendSchema), async (req, res) => {
  const { mobile, purpose, loan, utm, scoreRequest } = req.body as z.infer<typeof otpSendSchema>;
  const r = await sendOtp(mobile, purpose, ip(req));
  let leadId: string | undefined;
  let leadToken: string | undefined;

  if (purpose === 'apply' && loan) {
    const mobileHash = lookupHash(mobile);
    const customerId = await upsertCustomer(db, mobile, mobileHash);
    await recordConsent(db, {
      customerId,
      mobileHash,
      purpose: 'contact',
      source: 'apply',
      ip: ip(req),
      userAgent: req.get('user-agent'),
    });

    const existing = await db('leads')
      .where({ customer_id: customerId, product_slug: loan.product, status: 'new' })
      .andWhere('created_at', '>', db.raw("now() - interval '30 minutes'"))
      .orderBy('created_at', 'desc')
      .first();

    if (existing) {
      leadId = existing.id;
      await db('leads')
        .where({ id: leadId })
        .update({
          amount: loan.amount,
          tenure_months: loan.tenureMonths,
          employment: loan.employment,
          monthly_income: loan.monthlyIncome,
          utm: utm ? JSON.stringify(utm) : existing.utm,
          updated_at: db.fn.now(),
        });
    } else {
      const [row] = await db('leads')
        .insert({
          customer_id: customerId,
          product_slug: loan.product,
          amount: loan.amount,
          tenure_months: loan.tenureMonths,
          employment: loan.employment,
          monthly_income: loan.monthlyIncome,
          status: 'new',
          utm: utm ? JSON.stringify(utm) : null,
        })
        .returning('id');
      leadId = (row as { id: string }).id;
    }
    leadToken = signToken({ t: 'lead', lid: leadId }, LEAD_TOKEN_TTL);
  }

  if (purpose === 'score' && scoreRequest) {
    const mobileHash = lookupHash(mobile);
    const customerId = await upsertCustomer(db, mobile, mobileHash);
    await recordConsent(db, {
      customerId,
      mobileHash,
      purpose: 'bureau',
      source: 'credit_score',
      ip: ip(req),
      userAgent: req.get('user-agent'),
    });
    const ref = reference('CS');
    await db('credit_score_requests').insert({
      reference_no: ref,
      customer_id: customerId,
      full_name_enc: encrypt(scoreRequest.fullName),
      pan_enc: encrypt(scoreRequest.pan),
      pan_hash: lookupHash(scoreRequest.pan),
      provider: env.BUREAU_PROVIDER,
    });
  }

  res.status(201).json({
    challengeId: r.challengeId,
    resendAfter: r.resendAfter,
    ...(r.devCode ? { devCode: r.devCode } : {}),
    ...(leadId ? { leadId, leadToken } : {}),
  });
});

publicRouter.post('/otp/verify', otpLimiter, validate(otpVerifySchema), async (req, res) => {
  const { challengeId, code } = req.body as z.infer<typeof otpVerifySchema>;
  res.json(await verifyOtp(challengeId, code));
});

publicRouter.post('/leads', formLimiter, validate(createLeadSchema), async (req, res) => {
  const b = req.body as CreateLeadInput;
  const product = PRODUCT_LIST.find((p) => p.slug === b.product)!;
  if (
    product.kind === 'loan' &&
    (b.tenureMonths < product.tenure.min || b.tenureMonths > product.tenure.max)
  ) {
    throw new AppError(422, 'validation_failed', 'Please check the highlighted fields', {
      tenureMonths: 'Choose a tenure from the list',
    });
  }
  const leadId = await db.transaction(async (trx) => {
    const { mobile, mobileHash } = await consumeVerification(b.verificationToken, 'apply', trx);
    const customerId = await upsertCustomer(trx, mobile, mobileHash);
    await recordConsent(trx, {
      customerId,
      mobileHash,
      purpose: 'contact',
      source: 'apply',
      ip: ip(req),
      userAgent: req.get('user-agent'),
    });

    const existing = await trx('leads')
      .where({ customer_id: customerId, product_slug: b.product, status: 'new' })
      .andWhere('created_at', '>', trx.raw("now() - interval '30 minutes'"))
      .orderBy('created_at', 'desc')
      .first();

    if (existing) {
      await trx('leads')
        .where({ id: existing.id })
        .update({
          amount: b.amount,
          tenure_months: b.tenureMonths,
          employment: b.employment,
          monthly_income: b.monthlyIncome,
          utm: b.utm ? JSON.stringify(b.utm) : existing.utm,
          updated_at: trx.fn.now(),
        });
      return existing.id;
    }

    const [row] = await trx('leads')
      .insert({
        customer_id: customerId,
        product_slug: b.product,
        amount: b.amount,
        tenure_months: b.tenureMonths,
        employment: b.employment,
        monthly_income: b.monthlyIncome,
        utm: b.utm ? JSON.stringify(b.utm) : null,
      })
      .returning('id');
    return (row as { id: string }).id;
  });
  res.status(201).json({ leadId, leadToken: signToken({ t: 'lead', lid: leadId }, LEAD_TOKEN_TTL) });
});

publicRouter.get(
  '/leads/:id/offers',
  requireLeadToken,
  validate(z.object({ sort: offerSortSchema.default('apr') }), 'query'),
  async (req, res) => {
    const { sort } = res.locals.query as { sort: z.infer<typeof offerSortSchema> };
    const r = await offersForLead(req.params.id as string, sort);
    if (!r) throw notFound('Application');
    res.set('cache-control', 'no-store').json(r);
  },
);

publicRouter.post(
  '/applications',
  formLimiter,
  requireLeadToken,
  validate(createApplicationSchema),
  async (req, res) => {
    const b = req.body as z.infer<typeof createApplicationSchema>;
    const leadId = res.locals.leadId!;
    const referenceNo = await db.transaction(async (trx) => {
      const offer = await trx('offer_snapshots').where({ id: b.offerId, lead_id: leadId }).first('id');
      if (!offer)
        throw new AppError(422, 'offer_invalid', 'That offer is no longer available. Please choose again.');
      const existing = await trx('applications').where({ lead_id: leadId }).first('reference_no');
      if (existing) return existing.reference_no as string;
      const lead = await trx('leads').where({ id: leadId }).first('customer_id');
      const customer = await trx('customers').where({ id: lead.customer_id }).first('mobile_hash');
      await recordConsent(trx, {
        customerId: lead.customer_id,
        mobileHash: customer.mobile_hash,
        purpose: 'bureau',
        source: 'apply',
        ip: ip(req),
        userAgent: req.get('user-agent'),
      });
      const ref = reference('DK');
      await trx('applications').insert({
        reference_no: ref,
        lead_id: leadId,
        offer_id: b.offerId,
        full_name_enc: encrypt(b.fullName),
        dob_enc: encrypt(b.dob),
        pan_enc: encrypt(b.pan),
        pan_hash: lookupHash(b.pan),
        email_enc: encrypt(b.email),
        employer: b.employer,
        pincode: b.pincode,
        city: b.city,
      });
      await trx('leads').where({ id: leadId }).update({ updated_at: trx.fn.now() });
      return ref;
    });
    res.status(201).json({ referenceNo });
  },
);

/**
 * Credit score. No bureau contract exists yet (BUREAU_PROVIDER=none), so every request is booked for an
 * advisor, who pulls the report with the person's consent and calls back. No score is ever invented.
 */
publicRouter.post(
  '/credit-score/requests',
  formLimiter,
  validate(creditScoreRequestSchema),
  async (req, res) => {
    const b = req.body as z.infer<typeof creditScoreRequestSchema>;
    const ref = await db.transaction(async (trx) => {
      const { mobile, mobileHash } = await consumeVerification(b.verificationToken, 'score', trx);
      const customerId = await upsertCustomer(trx, mobile, mobileHash);
      await recordConsent(trx, {
        customerId,
        mobileHash,
        purpose: 'bureau',
        source: 'credit_score',
        ip: ip(req),
        userAgent: req.get('user-agent'),
      });
      const r = reference('CS');
      await trx('credit_score_requests').insert({
        reference_no: r,
        customer_id: customerId,
        full_name_enc: encrypt(b.fullName),
        pan_enc: encrypt(b.pan),
        pan_hash: lookupHash(b.pan),
        provider: env.BUREAU_PROVIDER,
      });
      return r;
    });
    res.status(201).json({ status: 'advisor_review', reference: ref });
  },
);

publicRouter.post('/callbacks', formLimiter, validate(callbackSchema), async (req, res) => {
  const b = req.body as CallbackInput;
  if (b.website) return res.status(201).json({ id: 'ok' }); // honeypot: pretend success
  const [row] = await db('callbacks')
    .insert({
      name: b.name,
      mobile_hash: lookupHash(b.mobile),
      mobile_enc: encrypt(b.mobile),
      product_slug: b.product,
      city: b.city,
      slot: b.slot,
    })
    .returning('id');
  await recordConsent(db, {
    customerId: null,
    mobileHash: lookupHash(b.mobile),
    purpose: 'contact',
    source: 'callback',
    ip: ip(req),
    userAgent: req.get('user-agent'),
  });
  res.status(201).json({ id: (row as { id: string }).id });
});

publicRouter.post('/partners', formLimiter, validate(partnerSchema), async (req, res) => {
  const b = req.body as PartnerInput;
  if (b.website) return res.status(201).json({ id: 'ok' });
  const [row] = await db('partner_applications')
    .insert({
      name: b.name,
      mobile_hash: lookupHash(b.mobile),
      mobile_enc: encrypt(b.mobile),
      email_enc: encrypt(b.email),
      city: b.city,
      profession: b.profession,
      experience: b.experience,
    })
    .returning('id');
  res.status(201).json({ id: (row as { id: string }).id });
});

publicRouter.post('/grievances', formLimiter, validate(grievanceSchema), async (req, res) => {
  const b = req.body as GrievanceInput;
  if (b.website) return res.status(201).json({ ticketNo: 'GR-RECEIVED' });
  const ticketNo = reference('GR');
  await db('grievances').insert({
    ticket_no: ticketNo,
    name: b.name,
    mobile_hash: lookupHash(b.mobile),
    mobile_enc: encrypt(b.mobile),
    reference_no: b.referenceNo || null,
    category: b.category,
    message: b.message,
    due_at: new Date(Date.now() + 30 * 86400_000),
  });
  res.status(201).json({ ticketNo });
});
