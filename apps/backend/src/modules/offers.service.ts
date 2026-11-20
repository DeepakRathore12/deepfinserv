import {
  computeOffers,
  OFFER_RULE_VERSION,
  PRODUCTS,
  maxServiceable,
  type OfferSort,
  type RateCardInput,
} from '@dk/shared';
import type { Knex } from 'knex';
import { db } from '../config/db';
import { env } from '../config/env';

/** Live rate cards for a product. Sample lenders are excluded in production. */
export async function activeRateCards(product: string, k: Knex = db): Promise<RateCardInput[]> {
  const q = k('rate_cards as r')
    .join('lenders as l', 'l.id', 'r.lender_id')
    .where({ 'r.product_slug': product, 'r.active': true, 'l.active': true })
    .andWhere('r.effective_from', '<=', k.raw('current_date'))
    .andWhere((w) => w.whereNull('r.effective_to').orWhere('r.effective_to', '>=', k.raw('current_date')))
    .select(
      'r.id as rateCardId',
      'l.id as lenderId',
      'l.name as lenderName',
      'l.lender_type as lenderType',
      'r.kfs_url as kfsUrl',
      'r.apr_min as aprMin',
      'r.apr_max as aprMax',
      'r.processing_fee_pct as processingFeePct',
      'r.min_income as minIncome',
      'r.max_amount as maxAmount',
      'r.min_tenure as minTenure',
      'r.max_tenure as maxTenure',
      'r.foir_cap as foirCap',
    );
  if (env.NODE_ENV === 'production') q.andWhere('l.is_sample', false);
  const rows = (await q) as Record<string, unknown>[];
  return rows.map((r) => ({
    ...(r as unknown as RateCardInput),
    aprMin: Number(r.aprMin),
    aprMax: Number(r.aprMax),
    processingFeePct: Number(r.processingFeePct),
    minIncome: Number(r.minIncome),
    maxAmount: Number(r.maxAmount),
    foirCap: r.foirCap == null ? null : Number(r.foirCap),
  }));
}

interface LeadRow {
  id: string;
  product_slug: string;
  amount: string;
  tenure_months: number;
  monthly_income: string;
}

/**
 * Offers are computed once per lead and frozen in offer_snapshots, so what the person saw is what we
 * can later prove they saw, even if a rate card changes. Sorting is applied on read.
 */
export async function offersForLead(leadId: string, sort: OfferSort) {
  const lead = (await db('leads').where({ id: leadId }).first()) as LeadRow | undefined;
  if (!lead) return null;
  const req = {
    amount: Number(lead.amount),
    tenureMonths: lead.tenure_months,
    monthlyIncome: Number(lead.monthly_income),
  };

  let snaps = await db('offer_snapshots as o')
    .join('lenders as l', 'l.id', 'o.lender_id')
    .join('rate_cards as r', 'r.id', 'o.rate_card_id')
    .where('o.lead_id', leadId)
    .select('o.*', 'l.name as lender_name', 'l.lender_type', 'r.kfs_url');
  if (snaps.length === 0) {
    const offers = computeOffers(req, await activeRateCards(lead.product_slug), 'apr');
    if (offers.length) {
      await db('offer_snapshots')
        .insert(
          offers.map((o) => ({
            lead_id: leadId,
            rate_card_id: o.rateCardId,
            lender_id: o.lenderId,
            apr: o.apr,
            amount: o.amount,
            emi: o.emi,
            processing_fee: o.processingFee,
            processing_fee_pct: o.processingFeePct,
            tenure_months: o.tenureMonths,
            full_amount: o.fullAmount,
            best_match: o.bestMatch,
            match_reason: o.matchReason,
            rule_version: OFFER_RULE_VERSION,
          })),
        )
        .onConflict(['lead_id', 'rate_card_id'])
        .ignore();
      snaps = await db('offer_snapshots as o')
        .join('lenders as l', 'l.id', 'o.lender_id')
        .join('rate_cards as r', 'r.id', 'o.rate_card_id')
        .where('o.lead_id', leadId)
        .select('o.*', 'l.name as lender_name', 'l.lender_type', 'r.kfs_url');
    }
  }

  const offers = (snaps as Record<string, unknown>[]).map((s) => ({
    id: s.id as string,
    lenderName: s.lender_name as string,
    lenderType: s.lender_type as string,
    kfsUrl: (s.kfs_url as string | null) ?? null,
    apr: Number(s.apr),
    amount: Number(s.amount),
    emi: Number(s.emi),
    processingFee: Number(s.processing_fee),
    processingFeePct: Number(s.processing_fee_pct),
    tenureMonths: Number(s.tenure_months),
    fullAmount: Boolean(s.full_amount),
    bestMatch: Boolean(s.best_match),
    matchReason: s.match_reason as string,
  }));
  const by: Record<OfferSort, (a: (typeof offers)[number], b: (typeof offers)[number]) => number> = {
    apr: (a, b) => a.apr - b.apr || b.amount - a.amount,
    emi: (a, b) => a.emi - b.emi,
    amount: (a, b) => b.amount - a.amount || a.apr - b.apr,
  };
  offers.sort(by[sort]);
  const product = PRODUCTS[lead.product_slug as keyof typeof PRODUCTS];
  return {
    offers,
    maxEligible: maxServiceable(req, product?.indicativeRate || 12),
    ruleVersion: OFFER_RULE_VERSION,
  };
}
