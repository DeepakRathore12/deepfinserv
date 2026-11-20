import { z } from 'zod';
import { PRODUCT_SLUGS } from './catalogue';
import {
  citySchema,
  dobSchema,
  emailSchema,
  mobileSchema,
  otpCodeSchema,
  panSchema,
  personNameSchema,
  pincodeSchema,
  rupeesSchema,
} from './validation';

/** Request contracts for /api/v1. The backend validates with these; the frontend forms reuse them. */

export const productSlugSchema = z.enum(PRODUCT_SLUGS);
export const employmentSchema = z.enum(['salaried', 'self_employed']);
export const otpPurposeSchema = z.enum(['apply', 'score', 'callback']);

export const utmSchema = z
  .object({
    source: z.string().max(100).optional(),
    medium: z.string().max(100).optional(),
    campaign: z.string().max(100).optional(),
    term: z.string().max(100).optional(),
    content: z.string().max(100).optional(),
  })
  .partial()
  .optional();

/** Step 1 of the application, also used by the home loan matcher. */
export const loanRequestSchema = z.object({
  product: productSlugSchema,
  amount: rupeesSchema(10000, 100000000, 'Enter an amount between ₹10,000 and ₹10 crore'),
  tenureMonths: z.number().int().min(0).max(360),
  employment: employmentSchema,
  monthlyIncome: rupeesSchema(10000, 100000000, 'Enter at least ₹10,000 a month'),
});

export const otpSendSchema = z.object({
  mobile: mobileSchema,
  purpose: otpPurposeSchema,
  loan: loanRequestSchema.optional(),
  utm: utmSchema,
  scoreRequest: z
    .object({
      fullName: personNameSchema,
      pan: panSchema,
    })
    .optional(),
});
export const otpVerifySchema = z.object({ challengeId: z.string().uuid(), code: otpCodeSchema });

export const createLeadSchema = loanRequestSchema.extend({
  verificationToken: z.string().min(20),
  consentContact: z.literal(true, { message: 'Tick this box to continue' }),
  utm: utmSchema,
});

export const offerSortSchema = z.enum(['apr', 'emi', 'amount']);

export const applicationDetailsSchema = z.object({
  fullName: personNameSchema,
  dob: dobSchema,
  pan: panSchema,
  email: emailSchema,
  employer: z.string().trim().min(2, 'This is required').max(120),
  pincode: pincodeSchema,
  city: citySchema,
  consentBureau: z.literal(true, { message: 'The lender needs this to process your loan' }),
});

export const createApplicationSchema = applicationDetailsSchema.extend({
  offerId: z.string().uuid(),
});

export const creditScoreRequestSchema = z.object({
  fullName: personNameSchema,
  pan: panSchema,
  verificationToken: z.string().min(20),
  consentBureau: z.literal(true, { message: 'Please give consent to continue' }),
});

export const callbackSchema = z.object({
  name: personNameSchema,
  mobile: mobileSchema,
  product: productSlugSchema.nullable(),
  city: citySchema,
  slot: z.enum(['morning', 'afternoon', 'evening']),
  website: z.string().max(0).optional(),
});

export const PARTNER_PROFESSIONS = [
  'Chartered accountant or tax consultant',
  'Insurance or mutual fund agent',
  'Real estate broker',
  'Existing DSA or connector',
  'Car dealer',
  'Other',
] as const;
export const PARTNER_EXPERIENCE = [
  'None yet',
  'Less than 1 year',
  '1 to 3 years',
  'More than 3 years',
] as const;

export const partnerSchema = z.object({
  name: personNameSchema,
  mobile: mobileSchema,
  email: emailSchema,
  city: citySchema,
  profession: z.enum(PARTNER_PROFESSIONS),
  experience: z.enum(PARTNER_EXPERIENCE),
  website: z.string().max(0).optional(),
});

export const GRIEVANCE_CATEGORIES = [
  'Delay in processing',
  'Unsolicited calls or messages',
  'Someone asked me for money',
  'Wrong information given',
  'Data privacy concern',
  'Other',
] as const;

export const grievanceSchema = z.object({
  name: personNameSchema,
  mobile: mobileSchema,
  referenceNo: z.string().trim().max(20).optional().or(z.literal('')),
  category: z.enum(GRIEVANCE_CATEGORIES),
  message: z.string().trim().min(20, 'Please write at least 20 characters').max(2000),
  website: z.string().max(0).optional(),
});

export type LoanRequest = z.infer<typeof loanRequestSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type ApplicationDetails = z.infer<typeof applicationDetailsSchema>;
export type CallbackInput = z.infer<typeof callbackSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
export type GrievanceInput = z.infer<typeof grievanceSchema>;

/** Error shape returned by every endpoint. */
export interface ApiErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}
