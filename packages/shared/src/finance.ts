/** Loan maths shared by calculators, the offer engine and tests. All money in rupees. */

export function emi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 1200;
  if (r === 0) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

/** Largest principal a given EMI can service. */
export function maxPrincipal(monthlyEmi: number, annualRatePct: number, months: number): number {
  if (monthlyEmi <= 0 || months <= 0) return 0;
  const r = annualRatePct / 1200;
  if (r === 0) return monthlyEmi * months;
  const f = (1 + r) ** months;
  return (monthlyEmi * (f - 1)) / (r * f);
}

export interface YearRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

export function yearlySchedule(principal: number, annualRatePct: number, months: number): YearRow[] {
  const pay = emi(principal, annualRatePct, months);
  const r = annualRatePct / 1200;
  const rows: YearRow[] = [];
  let balance = principal;
  for (let y = 1; y <= Math.ceil(months / 12); y += 1) {
    let p = 0;
    let i = 0;
    for (let m = 0; m < 12 && (y - 1) * 12 + m < months; m += 1) {
      const interest = balance * r;
      const princ = pay - interest;
      i += interest;
      p += princ;
      balance = Math.max(0, balance - princ);
    }
    rows.push({ year: y, principalPaid: p, interestPaid: i, balance });
  }
  return rows;
}

export interface BalanceTransferResult {
  currentEmi: number;
  newEmi: number;
  monthlySaving: number;
  fee: number;
  netSaving: number;
  worthIt: boolean;
}

export function balanceTransfer(
  outstanding: number,
  currentRate: number,
  newRate: number,
  months: number,
  feePct: number,
): BalanceTransferResult {
  const currentEmi = emi(outstanding, currentRate, months);
  const newEmi = emi(outstanding, newRate, months);
  const fee = (outstanding * feePct) / 100;
  const netSaving = (currentEmi - newEmi) * months - fee;
  return {
    currentEmi,
    newEmi,
    monthlySaving: Math.max(0, currentEmi - newEmi),
    fee,
    netSaving: Math.max(0, netSaving),
    worthIt: netSaving > 0,
  };
}

export interface PrepaymentResult {
  emi: number;
  newMonths: number;
  monthsSaved: number;
  interestSaved: number;
}

/** Part-prepayment keeping the EMI fixed and reducing tenure. */
export function prepayment(
  outstanding: number,
  annualRatePct: number,
  months: number,
  amount: number,
): PrepaymentResult {
  const pay = emi(outstanding, annualRatePct, months);
  const r = annualRatePct / 1200;
  const left = Math.max(0, outstanding - amount);
  const newMonths = left > 0 && pay > left * r ? -Math.log(1 - (r * left) / pay) / Math.log(1 + r) : 0;
  const before = pay * months - outstanding;
  const after = Math.max(0, pay * newMonths - left);
  return {
    emi: pay,
    newMonths,
    monthsSaved: Math.max(0, months - newMonths),
    interestSaved: Math.max(0, before - after),
  };
}

/** Lenders usually let all EMIs reach about half of monthly income. */
export const DEFAULT_FOIR = 0.5;

export function eligibleAmount(
  monthlyIncome: number,
  existingEmis: number,
  annualRatePct: number,
  months: number,
  foir = DEFAULT_FOIR,
): { affordableEmi: number; amount: number } {
  const affordableEmi = Math.max(0, monthlyIncome * foir - existingEmis);
  const amount = Math.floor(maxPrincipal(affordableEmi, annualRatePct, months) / 1000) * 1000;
  return { affordableEmi, amount };
}

export const formatINR = (n: number): string => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function amountInWords(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.?0+$/, '')} crore`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.?0+$/, '')} lakh`;
  return '';
}

export function tenureLabel(months: number): string {
  const m = Math.round(months);
  const y = Math.floor(m / 12);
  const mo = m % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} ${y === 1 ? 'yr' : 'yrs'}`);
  if (mo) parts.push(`${mo} mo`);
  return parts.join(' ') || '0 mo';
}
