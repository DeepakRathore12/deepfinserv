import { z } from 'zod';

/** Indian mobile: 10 digits starting 6-9. */
export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

/** PAN: five letters, four digits, one letter. */
export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, 'Enter a valid PAN, like ABCDE1234F');

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode');

export const personNameSchema = z
  .string()
  .trim()
  .min(3, 'Enter your full name')
  .max(100, 'Name is too long')
  .regex(/^[A-Za-z][A-Za-z .']+$/, 'Use letters only');

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(200);

export const citySchema = z.string().trim().min(2, 'Enter your city').max(80);

export const otpCodeSchema = z.string().regex(/^\d{6}$/, 'Enter the 6-digit code');

/** Age in whole years on a given day. */
export function ageOn(dob: string, today: Date = new Date()): number {
  const b = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(b.getTime())) return -1;
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age -= 1;
  return age;
}

export const dobSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter your date of birth')
  .refine((d) => {
    const a = ageOn(d);
    return a >= 21 && a <= 65;
  }, 'You need to be between 21 and 65');

/** Accepts "5,00,000", "500000" or a number; returns rupees as an integer. */
export const rupeesSchema = (min: number, max: number, message: string) =>
  z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === 'number' ? Math.round(v) : Number(String(v).replace(/[^\d]/g, ''))))
    .pipe(z.number().int().min(min, message).max(max, message));
