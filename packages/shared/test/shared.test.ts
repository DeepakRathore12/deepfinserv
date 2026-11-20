import { describe, expect, it } from 'vitest';
import {
  balanceTransfer,
  computeOffers,
  emi,
  eligibleAmount,
  mobileSchema,
  panSchema,
  prepayment,
  rupeesSchema,
  yearlySchedule,
  type RateCardInput,
} from '../src';

describe('finance', () => {
  it('matches the standard EMI formula', () => {
    expect(Math.round(emi(500000, 10.49, 36))).toBe(16249);
    expect(emi(120000, 0, 12)).toBe(10000);
  });
  it('schedule pays off the loan', () => {
    const rows = yearlySchedule(500000, 11, 36);
    expect(rows).toHaveLength(3);
    expect(rows.at(-1)!.balance).toBeLessThan(1);
    const paid = rows.reduce((s, r) => s + r.principalPaid, 0);
    expect(Math.round(paid)).toBe(500000);
  });
  it('balance transfer flags when fees cancel savings', () => {
    expect(balanceTransfer(2500000, 9.5, 8.5, 180, 0.5).worthIt).toBe(true);
    expect(balanceTransfer(500000, 9.0, 8.95, 12, 2).worthIt).toBe(false);
  });
  it('prepayment shortens tenure and saves interest', () => {
    const r = prepayment(2000000, 9, 180, 200000);
    expect(r.monthsSaved).toBeGreaterThan(20);
    expect(r.interestSaved).toBeGreaterThan(0);
  });
  it('eligibility uses half of income minus existing EMIs', () => {
    expect(eligibleAmount(60000, 5000, 10.5, 60).affordableEmi).toBe(25000);
    expect(eligibleAmount(20000, 15000, 10.5, 60).amount).toBe(0);
  });
});

describe('validation', () => {
  it('accepts valid and rejects invalid mobiles', () => {
    expect(mobileSchema.safeParse('9876543210').success).toBe(true);
    expect(mobileSchema.safeParse('5876543210').success).toBe(false);
    expect(mobileSchema.safeParse('98765').success).toBe(false);
  });
  it('normalises PAN case', () => {
    expect(panSchema.parse('abcde1234f')).toBe('ABCDE1234F');
    expect(panSchema.safeParse('ABCD1234F').success).toBe(false);
  });
  it('parses formatted rupee strings', () => {
    expect(rupeesSchema(10000, 1e8, 'x').parse('5,00,000')).toBe(500000);
    expect(rupeesSchema(10000, 1e8, 'x').safeParse('900').success).toBe(false);
  });
});

const card = (o: Partial<RateCardInput>): RateCardInput => ({
  rateCardId: 'c',
  lenderId: 'l',
  lenderName: 'Lender',
  lenderType: 'private_bank',
  kfsUrl: null,
  aprMin: 10.5,
  aprMax: 18,
  processingFeePct: 1,
  minIncome: 25000,
  maxAmount: 4000000,
  minTenure: 12,
  maxTenure: 60,
  foirCap: null,
  ...o,
});

describe('offer rule v1', () => {
  const req = { amount: 500000, tenureMonths: 36, monthlyIncome: 60000 };
  it('marks the lowest-APR full-amount offer as best match', () => {
    const offers = computeOffers(req, [
      card({ rateCardId: 'a', aprMin: 11 }),
      card({ rateCardId: 'b', aprMin: 10.5 }),
    ]);
    expect(offers[0]!.rateCardId).toBe('b');
    expect(offers.filter((o) => o.bestMatch)).toHaveLength(1);
    expect(offers[0]!.matchReason).toMatch(/Lowest APR/);
  });
  it('drops cards the income does not meet', () => {
    expect(computeOffers({ ...req, monthlyIncome: 20000 }, [card({})])).toHaveLength(0);
  });
  it('caps the amount by income and flags lower amounts', () => {
    const [o] = computeOffers({ ...req, amount: 2000000, monthlyIncome: 40000 }, [card({})]);
    expect(o!.fullAmount).toBe(false);
    expect(o!.amount).toBeLessThan(2000000);
    expect(o!.bestMatch).toBe(false);
  });
  it('sorts by EMI when asked', () => {
    const offers = computeOffers(
      req,
      [card({ rateCardId: 'a', aprMin: 12 }), card({ rateCardId: 'b', aprMin: 10.5 })],
      'emi',
    );
    expect(offers[0]!.emi).toBeLessThanOrEqual(offers[1]!.emi);
  });
});
