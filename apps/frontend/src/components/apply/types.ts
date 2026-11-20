import type { LenderType, ProductSlug } from '@dk/shared';

export interface LoanDraft {
  product: ProductSlug;
  amount: string;
  tenureMonths: number;
  employment: 'salaried' | 'self_employed';
  monthlyIncome: string;
}

export interface OfferView {
  id: string;
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
  matchReason: string;
}

export interface OffersResponse {
  offers: OfferView[];
  maxEligible: number;
  ruleVersion: string;
}

export interface LeadSession {
  leadId: string;
  leadToken: string;
}

export interface ApplicationDone {
  referenceNo: string;
  lenderName: string;
  apr: number;
  emi: number;
  amount: number;
  documents: string[];
  email: string;
  firstName: string;
}
