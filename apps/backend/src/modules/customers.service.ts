import type { Knex } from 'knex';
import { encrypt, lookupHash } from '../utils/crypto';

/** Wording versions shown on the forms. Bump when the consent text changes. */
export const CONSENT_VERSION = { contact: 'c-2026-11b', bureau: 'b-2026-11' } as const;

export async function upsertCustomer(trx: Knex, mobile: string, mobileHash: string): Promise<string> {
  const [row] = await trx('customers')
    .insert({ mobile_hash: mobileHash, mobile_enc: encrypt(mobile) })
    .onConflict('mobile_hash')
    .merge(['updated_at'])
    .returning('id');
  return (row as { id: string }).id;
}

export async function recordConsent(
  trx: Knex,
  c: {
    customerId: string | null;
    mobileHash: string;
    purpose: 'contact' | 'bureau';
    source: string;
    ip: string;
    userAgent?: string;
  },
) {
  await trx('consents').insert({
    customer_id: c.customerId,
    mobile_hash: c.mobileHash,
    purpose: c.purpose,
    text_version: CONSENT_VERSION[c.purpose],
    source: c.source,
    ip_hash: lookupHash(c.ip),
    user_agent: c.userAgent?.slice(0, 300) ?? null,
  });
}
