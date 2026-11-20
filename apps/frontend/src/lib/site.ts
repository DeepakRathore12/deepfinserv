import { PRODUCT_LIST } from '@dk/shared';

/**
 * Business details shown across the site. Values marked TODO are placeholders from the design
 * and must be replaced before launch.
 */
export const SITE = {
  name: 'DeepFinServ',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  description:
    'Compare loan offers from banks and NBFCs with one application. Free help from a DeepFinServ loan expert until disbursal.',
  phoneDisplay: '8305551215', // TODO: real toll-free number
  phoneHref: 'tel:8305551215',
  whatsappDisplay: '+91 8305551215', // TODO: real WhatsApp number
  whatsappHref: 'https://wa.me/918305551215',
  email: 'info@deepfinserv.in', // TODO: confirm domain
  grievanceEmail: 'grievance@deepfinserv.in',
  grievanceOfficer: '[Deepak]', // TODO: named grievance officer (RBI requirement)
  address: '[Main square Hatod, Indore, Madhya Pradesh]', // TODO
  hours: 'Monday to Saturday, 9 am to 7 pm',
} as const;

export const NAV = [
  { href: '/loans', label: 'Loans', caret: true },
  { href: '/calculators/emi', label: 'Calculators', caret: true },
  // { href: '/credit-score', label: 'CIBIL Score' }, // Temporarily disabled
  { href: '/loans/credit-cards', label: 'Credit Cards' },
  { href: '/partner', label: 'Become a partner' },
] as const;

export const FOOTER_PRODUCTS = PRODUCT_LIST.map((p) => ({ href: `/loans/${p.slug}`, label: p.name }));
