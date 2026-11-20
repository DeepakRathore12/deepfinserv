/**
 * Product catalogue: editorial copy reviewed in code, one source for the frontend pages,
 * the backend seed and the sitemap. Rates here are indicative fallbacks only; live
 * starting rates come from the lenders' rate cards in the database.
 */

export const PRODUCT_SLUGS = [
  'personal-loan',
  'home-loan',
  'business-loan',
  'loan-against-property',
  'loan-against-securities',
  'education-loan',
  'car-loan',
  'balance-transfer',
  'credit-cards',
] as const;

export type ProductSlug = (typeof PRODUCT_SLUGS)[number];

export interface KV {
  k: string;
  v: string;
}
export interface Titled {
  t: string;
  d: string;
}
export interface Faq {
  q: string;
  a: string;
}

export interface Product {
  slug: ProductSlug;
  kind: 'loan' | 'card';
  name: string;
  /** Tile label in the loan matcher. */
  short: string;
  /** "a personal loan", used in sentences. */
  phrase: string;
  /** Lower-case name used in CTA copy: "See my personal loan offers". */
  ctaName: string;
  tag: string;
  card: { line: string; foot: string; badge?: { text: string; tone: 'cream' | 'mint' } };
  indicativeRate: number;
  amount: { min: number; max: number; step: number; default: number };
  tenure: { min: number; max: number; step: number; default: number; options: number[] };
  stats: KV[];
  features: Titled[];
  eligibility: string[];
  extraDocs: string[];
  fees: KV[];
  faqs: Faq[];
  meta: { title: string; description: string };
}

const commonFees = (processing: string, rate: string): KV[] => [
  { k: 'Interest rate', v: rate },
  { k: 'Processing fee', v: processing },
  { k: 'Prepayment charges', v: 'Up to 4% of amount prepaid' },
  { k: 'Late payment charges', v: 'Up to 2% a month on overdue' },
  { k: 'DeepFinServ service fee', v: '₹0' },
];

export const PRODUCTS: Record<ProductSlug, Product> = {
  'personal-loan': {
    slug: 'personal-loan',
    kind: 'loan',
    name: 'Personal Loan',
    short: 'Personal',
    phrase: 'a personal loan',
    ctaName: 'personal loan',
    tag: 'Money for weddings, travel, medical bills or anything else. No collateral and fast disbursal.',
    card: {
      line: 'Up to ₹40 lakh, no collateral',
      foot: 'From 10.49% p.a.',
      badge: { text: 'Quick sanction', tone: 'cream' },
    },
    indicativeRate: 10.49,
    amount: { min: 50000, max: 4000000, step: 25000, default: 500000 },
    tenure: { min: 12, max: 60, step: 6, default: 36, options: [12, 24, 36, 48, 60] },
    stats: [
      { k: 'Interest from', v: '10.49% p.a.' },
      { k: 'Amount up to', v: '₹40 lakh' },
      { k: 'Tenure', v: '1 to 5 years' },
      { k: 'Disbursal', v: 'As fast as 24 hrs' },
    ],
    features: [
      { t: 'No collateral', d: 'Borrow on the strength of your income and credit score.' },
      {
        t: 'Use it for anything',
        d: 'Weddings, travel, home repairs, medical needs or paying off costly debt.',
      },
      { t: 'Fixed EMIs', d: 'Know exactly what you pay each month from day one.' },
      { t: 'Minimal paperwork', d: 'Digital KYC and bank statement upload with most lenders.' },
    ],
    eligibility: [
      'Salaried with a take-home salary of ₹25,000 a month or more',
      'Age between 21 and 60 years',
      'At least 1 year of total work experience',
      'CIBIL score of 700 or above preferred',
    ],
    extraDocs: [],
    fees: commonFees('Up to 2% of loan amount', 'From 10.49% p.a.'),
    faqs: [
      {
        q: 'How fast can I get the money?',
        a: 'Once your documents are verified, many lenders disburse within 24 hours to 3 working days.',
      },
      {
        q: 'Can I get a personal loan with a low score?',
        a: 'Some NBFCs lend at scores below 700, usually at higher rates. Our loan expert can check options for you.',
      },
      {
        q: 'Can I close the loan early?',
        a: 'Yes. Most lenders allow foreclosure after 6 to 12 EMIs, with a small charge.',
      },
    ],
    meta: {
      title: 'Personal Loan: Compare Rates from Top Banks and NBFCs',
      description:
        'Compare personal loan offers up to ₹40 lakh from banks and NBFCs. Check eligibility in 2 minutes with no impact on your credit score. Free service.',
    },
  },
  'home-loan': {
    slug: 'home-loan',
    kind: 'loan',
    name: 'Home Loan',
    short: 'Home',
    phrase: 'a home loan',
    ctaName: 'home loan',
    tag: 'Buy, build or renovate your home with long tenures, low rates and tax benefits.',
    card: { line: 'Up to 30 years, tax benefits', foot: 'From 8.40% p.a.' },
    indicativeRate: 8.4,
    amount: { min: 500000, max: 50000000, step: 100000, default: 3000000 },
    tenure: { min: 60, max: 360, step: 12, default: 240, options: [60, 120, 180, 240, 300, 360] },
    stats: [
      { k: 'Interest from', v: '8.40% p.a.' },
      { k: 'Funding up to', v: '90% of value' },
      { k: 'Tenure up to', v: '30 years' },
      { k: 'Tax benefit', v: 'Up to ₹3.5 lakh a year' },
    ],
    features: [
      { t: 'Lowest rates', d: 'Compare banks and housing finance companies side by side.' },
      { t: 'Long tenures', d: 'Spread repayment up to 30 years for a smaller EMI.' },
      { t: 'Tax savings', d: 'Deductions on principal and interest under the Income Tax Act.' },
      { t: 'Property check help', d: 'Our expert guides you through legal and technical verification.' },
    ],
    eligibility: [
      'Salaried or self-employed Indian residents and NRIs',
      'Age 21 to 65 years at loan maturity',
      'Stable income with 2 years of work or business history',
      'Approved property with clear title',
    ],
    extraDocs: [
      'Sale agreement and title documents',
      'Approved building plan',
      'Payment receipts to the builder',
    ],
    fees: commonFees('Up to 0.5% of loan amount', 'From 8.40% p.a.'),
    faqs: [
      {
        q: 'How much can I borrow?',
        a: 'Usually up to 75 to 90% of the property value, depending on the loan size and your repayment capacity.',
      },
      {
        q: 'Fixed or floating rate?',
        a: 'Most home loans are floating, linked to an external benchmark. Floating loans have no prepayment charges for individuals.',
      },
      {
        q: 'Can I add a co-applicant?',
        a: 'Yes. Adding an earning family member can increase the amount you qualify for.',
      },
    ],
    meta: {
      title: 'Home Loan: Compare Interest Rates and Check Eligibility',
      description:
        'Compare home loan rates from banks and housing finance companies, up to 30 years. Free expert help from application to disbursal.',
    },
  },
  'business-loan': {
    slug: 'business-loan',
    kind: 'loan',
    name: 'Business Loan',
    short: 'Business',
    phrase: 'a business loan',
    ctaName: 'business loan',
    tag: 'Working capital and growth funding for MSMEs, traders and self-employed professionals.',
    card: { line: 'Working capital for MSMEs', foot: 'From 14.00% p.a.' },
    indicativeRate: 14,
    amount: { min: 100000, max: 5000000, step: 50000, default: 1000000 },
    tenure: { min: 12, max: 60, step: 6, default: 36, options: [12, 24, 36, 48, 60] },
    stats: [
      { k: 'Interest from', v: '14% p.a.' },
      { k: 'Amount up to', v: '₹50 lakh' },
      { k: 'Tenure', v: '1 to 5 years' },
      { k: 'Collateral', v: 'Not needed' },
    ],
    features: [
      { t: 'Unsecured funding', d: 'No property or asset pledge needed with most lenders.' },
      { t: 'Flexible use', d: 'Inventory, machinery, expansion or day-to-day working capital.' },
      { t: 'GST-based offers', d: 'Some lenders assess you on GST returns for faster approvals.' },
      { t: 'Overdraft options', d: 'Pay interest only on what you use with a credit line.' },
    ],
    eligibility: [
      'Business running for at least 2 years',
      'Annual turnover of ₹40 lakh or more',
      'Business profitable in the last year',
      'Owner aged 24 to 65 years',
    ],
    extraDocs: ['GST returns for the last 12 months', 'Business registration proof'],
    fees: commonFees('Up to 3% of loan amount', 'From 14% p.a.'),
    faqs: [
      {
        q: 'Do I need collateral?',
        a: 'Not for most unsecured business loans up to ₹50 lakh. Larger amounts may need security.',
      },
      {
        q: 'Can a new business apply?',
        a: 'Most lenders need 2 years of vintage. Talk to an expert about startup and Mudra options.',
      },
      {
        q: 'Which documents matter most?',
        a: 'ITR, bank statements and GST returns show your repayment capacity.',
      },
    ],
    meta: {
      title: 'Business Loan for MSMEs: Compare Unsecured Offers',
      description:
        'Unsecured business loans up to ₹50 lakh for MSMEs and self-employed professionals. Compare lenders and apply with a DeepFinServ loan expert.',
    },
  },
  'loan-against-property': {
    slug: 'loan-against-property',
    kind: 'loan',
    name: 'Loan Against Property',
    short: 'Property',
    phrase: 'a loan against property',
    ctaName: 'property loan',
    tag: 'Unlock the value of your residential or commercial property at rates lower than unsecured loans.',
    card: { line: "Unlock your property's value", foot: 'From 9.25% p.a.' },
    indicativeRate: 9.25,
    amount: { min: 500000, max: 50000000, step: 100000, default: 2500000 },
    tenure: { min: 60, max: 180, step: 12, default: 120, options: [60, 96, 120, 180] },
    stats: [
      { k: 'Interest from', v: '9.25% p.a.' },
      { k: 'Funding up to', v: '70% of value' },
      { k: 'Tenure up to', v: '15 years' },
      { k: 'Property', v: 'Home or shop' },
    ],
    features: [
      { t: 'Large amounts', d: 'Get higher loan amounts based on your property value.' },
      { t: 'Lower rates', d: 'Secured loans cost less than personal or business loans.' },
      { t: 'Keep using your property', d: 'Live in it or run your business as usual.' },
      { t: 'Long tenure', d: 'Up to 15 years for comfortable EMIs.' },
    ],
    eligibility: [
      'Salaried or self-employed with stable income',
      'Self-owned residential or commercial property',
      'Clear property title and approved plan',
      'Age 25 to 70 years at loan maturity',
    ],
    extraDocs: ['Property title chain documents', 'Latest property tax receipt'],
    fees: commonFees('Up to 1% of loan amount', 'From 9.25% p.a.'),
    faqs: [
      {
        q: 'How is the loan amount decided?',
        a: 'Lenders value your property and fund up to 50 to 70% of it, subject to your income.',
      },
      {
        q: 'Can I pledge a rented property?',
        a: 'Yes, and rental income can also count towards eligibility with some lenders.',
      },
      {
        q: 'What if I miss payments?',
        a: 'The lender can take legal action on the property. Choose an EMI you can comfortably pay.',
      },
    ],
    meta: {
      title: 'Loan Against Property: Compare Rates and Funding',
      description:
        'Borrow against your home or shop at secured-loan rates, up to 15 years. Compare lenders and get free expert help.',
    },
  },
  'loan-against-securities': {
    slug: 'loan-against-securities',
    kind: 'loan',
    name: 'Loan Against Securities',
    short: 'Securities',
    phrase: 'a loan against securities',
    ctaName: 'securities loan',
    tag: 'Borrow against your shares, mutual funds or bonds without selling them.',
    card: { line: 'Borrow on shares and mutual funds', foot: 'From 9.50% p.a.' },
    indicativeRate: 9.5,
    amount: { min: 50000, max: 20000000, step: 50000, default: 500000 },
    tenure: { min: 6, max: 36, step: 6, default: 12, options: [6, 12, 24, 36] },
    stats: [
      { k: 'Interest from', v: '9.50% p.a.' },
      { k: 'Funding up to', v: '50% of value' },
      { k: 'Tenure', v: 'Up to 3 years' },
      { k: 'Disbursal', v: 'Same day' },
    ],
    features: [
      { t: 'Stay invested', d: 'Your investments keep earning while pledged.' },
      { t: 'Pay interest on use', d: 'Most lenders offer an overdraft, so you pay only on what you draw.' },
      { t: 'Fully digital', d: 'Pledge online through your depository in minutes.' },
      { t: 'No income proof', d: 'Eligibility depends mainly on the value of your holdings.' },
    ],
    eligibility: [
      'Holdings in an approved list of shares or funds',
      'Demat account in your name',
      'Age 18 years or older',
      'Valid PAN and KYC',
    ],
    extraDocs: ['Demat holding statement', 'Mutual fund statement (CAS)'],
    fees: commonFees('Flat ₹999 to 1%', 'From 9.50% p.a.'),
    faqs: [
      {
        q: 'What happens if markets fall?',
        a: 'If the value of your pledge drops, the lender may ask you to add securities or repay part of the loan.',
      },
      {
        q: 'Which funds qualify?',
        a: 'Each lender has an approved list. Equity funds usually get about 50%, debt funds up to 80%.',
      },
      {
        q: 'Can I release my securities?',
        a: 'Yes, once you repay, the pledge is removed and units are free again.',
      },
    ],
    meta: {
      title: 'Loan Against Shares and Mutual Funds',
      description:
        'Borrow against your shares, mutual funds or bonds without selling them. Same-day disbursal with select lenders.',
    },
  },
  'education-loan': {
    slug: 'education-loan',
    kind: 'loan',
    name: 'Education Loan',
    short: 'Education',
    phrase: 'an education loan',
    ctaName: 'education loan',
    tag: 'Fund higher studies in India or abroad, with repayment starting after your course.',
    card: { line: 'Study in India or abroad', foot: 'From 9.00% p.a.' },
    indicativeRate: 9,
    amount: { min: 200000, max: 15000000, step: 100000, default: 2000000 },
    tenure: { min: 60, max: 180, step: 12, default: 120, options: [60, 84, 120, 180] },
    stats: [
      { k: 'Interest from', v: '9.00% p.a.' },
      { k: 'Amount up to', v: '₹1.5 crore' },
      { k: 'Tenure up to', v: '15 years' },
      { k: 'Moratorium', v: 'Course + 1 year' },
    ],
    features: [
      { t: 'Study now, pay later', d: 'Repayment starts after your course plus a grace period.' },
      { t: 'Covers full cost', d: 'Tuition, living, travel, books and laptop.' },
      { t: 'Tax benefit', d: 'Interest paid is deductible under Section 80E.' },
      { t: 'Collateral-free options', d: 'Available for top institutes with select lenders.' },
    ],
    eligibility: [
      'Indian student with admission to a recognised course',
      'Co-applicant parent or guardian with income',
      'Good academic record',
      'Collateral for higher amounts with some lenders',
    ],
    extraDocs: ['Admission letter and fee structure', 'Academic mark sheets', 'Co-applicant income proof'],
    fees: commonFees('Up to 1% of loan amount', 'From 9.00% p.a.'),
    faqs: [
      {
        q: 'Do I need collateral?',
        a: 'Not always. Many lenders offer unsecured loans for top universities up to a set amount.',
      },
      {
        q: 'When does repayment start?',
        a: 'Usually after course completion plus 6 to 12 months, though interest may accrue during study.',
      },
      {
        q: 'Can I get a loan before admission is confirmed?',
        a: 'Some lenders give a provisional sanction to help with visa applications.',
      },
    ],
    meta: {
      title: 'Education Loan for India and Abroad',
      description:
        'Education loans up to ₹1.5 crore covering tuition, living and travel, with repayment after your course. Compare lenders for free.',
    },
  },
  'car-loan': {
    slug: 'car-loan',
    kind: 'loan',
    name: 'Car Loan',
    short: 'Car',
    phrase: 'a car loan',
    ctaName: 'car loan',
    tag: 'Drive home a new or used car with fast approvals and up to 100% on-road funding.',
    card: { line: 'New and used cars', foot: 'From 8.75% p.a.' },
    indicativeRate: 8.75,
    amount: { min: 100000, max: 5000000, step: 50000, default: 800000 },
    tenure: { min: 12, max: 84, step: 12, default: 60, options: [24, 36, 48, 60, 84] },
    stats: [
      { k: 'Interest from', v: '8.75% p.a.' },
      { k: 'Funding up to', v: '100% on-road' },
      { k: 'Tenure up to', v: '7 years' },
      { k: 'Approval', v: 'Same day with some' },
    ],
    features: [
      { t: 'New and used cars', d: 'Finance both, from dealers or individual sellers.' },
      { t: 'High funding', d: 'Up to 100% of on-road price on select models.' },
      { t: 'Quick approvals', d: 'Many lenders approve within a day.' },
      { t: 'Flexible tenure', d: 'Choose 1 to 7 years to fit your budget.' },
    ],
    eligibility: [
      'Salaried or self-employed with stable income',
      'Age 21 to 65 years',
      'Minimum income of ₹20,000 a month',
      'Good repayment history',
    ],
    extraDocs: ['Proforma invoice from the dealer'],
    fees: commonFees('Up to 1% of loan amount', 'From 8.75% p.a.'),
    faqs: [
      {
        q: 'New or used car, which is cheaper to finance?',
        a: 'New car loans usually have lower rates. Used car rates depend on the car age.',
      },
      {
        q: 'Is a down payment needed?',
        a: 'Some lenders fund 100%, but a down payment lowers your EMI and interest.',
      },
      { q: 'Who holds the car papers?', a: 'The lender is marked on the RC until the loan is closed.' },
    ],
    meta: {
      title: 'Car Loan for New and Used Cars',
      description:
        'Car loans with up to 100% on-road funding and tenures up to 7 years. Compare rates from banks and NBFCs for free.',
    },
  },
  'balance-transfer': {
    slug: 'balance-transfer',
    kind: 'loan',
    name: 'Balance Transfer',
    short: 'Balance transfer',
    phrase: 'a balance transfer',
    ctaName: 'balance transfer',
    tag: 'Move your existing home or personal loan to a lender with a lower rate and cut your EMI.',
    card: {
      line: 'Move your loan to a lower rate',
      foot: 'See your savings',
      badge: { text: 'Lower EMI', tone: 'mint' },
    },
    indicativeRate: 8.4,
    amount: { min: 500000, max: 50000000, step: 100000, default: 2500000 },
    tenure: { min: 60, max: 360, step: 12, default: 180, options: [60, 120, 180, 240, 300, 360] },
    stats: [
      { k: 'Rates from', v: '8.40% p.a.' },
      { k: 'Top-up', v: 'Available' },
      { k: 'Tenure up to', v: '30 years' },
      { k: 'Lower EMI', v: 'From month one' },
    ],
    features: [
      { t: 'Lower EMI', d: 'Even a 0.5% lower rate saves a lot on a long loan.' },
      { t: 'Top-up loan', d: 'Borrow extra at home loan rates while you switch.' },
      { t: 'We handle the switch', d: 'Our expert coordinates the closure and transfer of documents.' },
      { t: 'See savings first', d: 'Use our calculator to check your savings before you apply.' },
    ],
    eligibility: [
      'At least 12 EMIs paid on the current loan',
      'No missed payments in the last 12 months',
      'Property and documents in order',
      'Remaining tenure of 3 years or more',
    ],
    extraDocs: [
      'Current loan statement',
      'Original sanction letter',
      'List of documents held by current lender',
    ],
    fees: commonFees('Up to 0.5% of transferred amount', 'From 8.40% p.a.'),
    faqs: [
      {
        q: 'Is a balance transfer worth it?',
        a: 'Usually yes when the rate gap is 0.5% or more and plenty of tenure is left. Our calculator shows the net saving after fees.',
      },
      {
        q: 'Will my current lender charge me?',
        a: 'Floating rate home loans for individuals have no foreclosure charges. Other loans may.',
      },
      {
        q: 'How long does it take?',
        a: 'Usually 2 to 4 weeks, including the transfer of your property documents.',
      },
    ],
    meta: {
      title: 'Home Loan Balance Transfer: Lower Your EMI',
      description:
        'Move your home or personal loan to a lower rate and cut your EMI. See your net savings after fees before you apply.',
    },
  },
  'credit-cards': {
    slug: 'credit-cards',
    kind: 'card',
    name: 'Credit Cards',
    short: 'Credit card',
    phrase: 'a credit card',
    ctaName: 'credit card',
    tag: 'Compare cashback, travel, fuel and lifetime-free cards matched to how you spend.',
    card: { line: 'Compare cashback and rewards', foot: 'Lifetime-free options' },
    indicativeRate: 0,
    amount: { min: 10000, max: 2000000, step: 10000, default: 100000 },
    tenure: { min: 0, max: 0, step: 1, default: 0, options: [] },
    stats: [
      { k: 'Cards from', v: 'Top banks' },
      { k: 'Joining fee', v: 'From ₹0' },
      { k: 'Rewards up to', v: '5% back' },
      { k: 'Approval', v: 'Instant with some' },
    ],
    features: [
      { t: 'Compare by spend', d: 'Find cards built for shopping, travel, fuel or dining.' },
      { t: 'Lifetime-free options', d: 'Choose cards with no joining or annual fee.' },
      { t: 'Instant decisions', d: 'Some banks approve and issue virtual cards in minutes.' },
      { t: 'Build your score', d: 'A card used well helps you build a strong credit history.' },
    ],
    eligibility: [
      'Age 21 to 60 years',
      'Income of ₹25,000 a month or ITR of ₹3 lakh a year',
      'CIBIL score of 700 or above preferred',
      'Resident of a serviceable city',
    ],
    extraDocs: [],
    fees: [
      { k: 'Joining fee', v: '₹0 to ₹2,500' },
      { k: 'Annual fee', v: 'Often waived on spends' },
      { k: 'Interest on unpaid dues', v: 'Up to 3.75% a month' },
      { k: 'Cash withdrawal fee', v: '2.5% of amount' },
      { k: 'DeepFinServ service fee', v: '₹0' },
    ],
    faqs: [
      {
        q: 'Will applying affect my score?',
        a: 'Comparing here does not. A formal application to a bank adds one hard enquiry.',
      },
      {
        q: 'Can I get a card without income proof?',
        a: 'Secured cards against a fixed deposit need no income proof.',
      },
      {
        q: 'Which card is best for me?',
        a: 'The one that rewards what you spend most on. Our expert can help you choose.',
      },
    ],
    meta: {
      title: 'Compare Credit Cards: Cashback, Travel and Lifetime Free',
      description:
        'Compare cashback, travel, fuel and lifetime-free credit cards matched to how you spend. Free, with no impact on your credit score.',
    },
  },
};

export const PRODUCT_LIST: Product[] = PRODUCT_SLUGS.map((s) => PRODUCTS[s]);

export const isProductSlug = (s: string): s is ProductSlug =>
  (PRODUCT_SLUGS as readonly string[]).includes(s);

export const BASE_DOCS = {
  salaried: [
    'PAN card',
    'Aadhaar card',
    'Last 3 months salary slips',
    'Last 6 months bank statement',
    'Form 16 for the last year',
  ],
  self: [
    'PAN card',
    'Aadhaar card',
    'ITR for the last 2 years with computation',
    'Last 12 months bank statement',
    'Business proof (GST or Udyam registration)',
  ],
} as const;

export const CALCULATOR_SLUGS = ['emi', 'eligibility', 'balance-transfer', 'prepayment'] as const;
export type CalculatorSlug = (typeof CALCULATOR_SLUGS)[number];
