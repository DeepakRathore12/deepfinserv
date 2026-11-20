import type { Knex } from 'knex';
import { PRODUCT_LIST } from '@dk/shared';

/** Products come straight from the shared catalogue so pages, API and database never disagree. */
export async function seedProducts(knex: Knex): Promise<number> {
  const rows = PRODUCT_LIST.map((p) => ({ slug: p.slug, name: p.name, kind: p.kind, active: true }));
  await knex('products').insert(rows).onConflict('slug').merge(['name', 'kind', 'updated_at']);
  return rows.length;
}

/**
 * Development-only placeholder lenders so the offer flow can be exercised end to end.
 * They are named "Sample lender" on purpose: DeepFinServ must load its real lending partners and their
 * signed rate cards through the admin area before launch. The API hides sample rows in production.
 */
const SAMPLE_LENDERS = [
  { name: 'Sample lender A (public bank)', lender_type: 'public_bank', base: 0.0 },
  { name: 'Sample lender B (private bank)', lender_type: 'private_bank', base: 0.6 },
  { name: 'Sample lender C (NBFC)', lender_type: 'nbfc', base: 2.0 },
  { name: 'Sample lender D (housing finance)', lender_type: 'hfc', base: 0.3 },
] as const;

const HOUSING = new Set(['home-loan', 'loan-against-property', 'balance-transfer']);

export async function seedSamples(knex: Knex): Promise<number> {
  let cards = 0;
  for (const l of SAMPLE_LENDERS) {
    const [row] = await knex('lenders')
      .insert({
        name: l.name,
        lender_type: l.lender_type,
        regulator: 'RBI',
        website: null,
        grievance_contact: "Placeholder. Replace with the lender's grievance officer before launch.",
        is_sample: true,
      })
      .onConflict('name')
      .merge(['updated_at'])
      .returning('id');
    const lenderId = (row as { id: string }).id;
    // Cards may already be referenced by offer snapshots, so a re-run leaves existing ones alone.
    if (await knex('rate_cards').where({ lender_id: lenderId }).first('id')) continue;
    for (const p of PRODUCT_LIST) {
      if (p.kind !== 'loan') continue;
      if (l.lender_type === 'hfc' && !HOUSING.has(p.slug)) continue;
      const apr = +(p.indicativeRate + l.base).toFixed(2);
      await knex('rate_cards').insert({
        lender_id: lenderId,
        product_slug: p.slug,
        apr_min: apr,
        apr_max: +(apr + 6).toFixed(2),
        processing_fee_pct: l.lender_type === 'nbfc' ? 2.5 : 1,
        min_income: l.lender_type === 'public_bank' ? 25000 : 15000,
        max_amount: p.amount.max,
        min_tenure: p.tenure.min,
        max_tenure: p.tenure.max,
        foir_cap: l.lender_type === 'nbfc' ? 0.6 : null,
        kfs_url: null,
      });
      cards += 1;
    }
  }
  return cards;
}
