import { DEFAULT_FOIR, emi, maxPrincipal } from './finance';

export const LENDER_TYPES = ['public_bank', 'private_bank', 'nbfc', 'hfc'] as const;
export type LenderType = (typeof LENDER_TYPES)[number];

export const LENDER_TYPE_LABEL: Record<LenderType, string> = {
  public_bank: 'Public sector bank',
  private_bank: 'Private sector bank',
  nbfc: 'NBFC',
  hfc: 'Housing finance company',
};

/** A dated rate card for one lender and one product, as stored in the database. */
export interface RateCardInput {
  rateCardId: string;
  lenderId: string;
  lenderName: string;
  lenderType: LenderType;
  kfsUrl: string | null;
  aprMin: number;
  aprMax: number;
  processingFeePct: number;
  minIncome: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  foirCap: number | null;
}

export interface OfferRequest {
  amount: number;
  tenureMonths: number;
  monthlyIncome: number;
}

export type OfferSort = 'apr' | 'emi' | 'amount';

export interface Offer {
  rateCardId: string;
  lenderId: string;
  lenderName: string;
  lenderType: LenderType;
  kfsUrl: string | null;
  apr: number;
  amount: number;
  emi: number;
  processingFee: number;
  processingFeePct: number;
  tenureMonths: number;
  fullAmount: boolean;
  bestMatch: boolean;
  /** Plain reason shown on the card so ranking is never unexplained. */
  matchReason: string;
}

export const OFFER_RULE_VERSION = 'v1';

/**
 * Offer rule v1. Each card must accept the income and tenure. The offered amount is the lower of the
 * asked amount, the card's limit and what the income can service at the card's starting APR. Offers
 * under 25% of the asked amount are dropped. "Best match" = lowest APR among offers meeting the full amount.
 */
export function computeOffers(req: OfferRequest, cards: RateCardInput[], sort: OfferSort = 'apr'): Offer[] {
  const offers: Offer[] = [];
  for (const c of cards) {
    if (req.monthlyIncome < c.minIncome) continue;
    if (req.tenureMonths < c.minTenure || req.tenureMonths > c.maxTenure) continue;
    const foir = c.foirCap ?? DEFAULT_FOIR;
    const serviceable =
      Math.floor(maxPrincipal(req.monthlyIncome * foir, c.aprMin, req.tenureMonths) / 1000) * 1000;
    const amount = Math.min(req.amount, c.maxAmount, serviceable);
    if (amount < Math.max(10000, req.amount * 0.25)) continue;
    offers.push({
      rateCardId: c.rateCardId,
      lenderId: c.lenderId,
      lenderName: c.lenderName,
      lenderType: c.lenderType,
      kfsUrl: c.kfsUrl,
      apr: c.aprMin,
      amount,
      emi: Math.round(emi(amount, c.aprMin, req.tenureMonths)),
      processingFeePct: c.processingFeePct,
      processingFee: Math.round((amount * c.processingFeePct) / 100),
      tenureMonths: req.tenureMonths,
      fullAmount: amount >= req.amount,
      bestMatch: false,
      matchReason: '',
    });
  }
  const full = offers.filter((o) => o.fullAmount).sort((a, b) => a.apr - b.apr);
  const best = full[0];
  for (const o of offers) {
    o.bestMatch = o === best;
    o.matchReason = o.bestMatch
      ? 'Lowest APR among offers for your full amount'
      : o.fullAmount
        ? 'Meets your full amount'
        : 'Lower amount based on your income';
  }
  const by: Record<OfferSort, (a: Offer, b: Offer) => number> = {
    apr: (a, b) => a.apr - b.apr || b.amount - a.amount,
    emi: (a, b) => a.emi - b.emi,
    amount: (a, b) => b.amount - a.amount || a.apr - b.apr,
  };
  return offers.sort(by[sort]);
}

/** The highest amount any lender could service on this income, for the "no match" message. */
export function maxServiceable(req: OfferRequest, baseApr: number): number {
  return Math.floor(maxPrincipal(req.monthlyIncome * DEFAULT_FOIR, baseApr, req.tenureMonths) / 1000) * 1000;
}
