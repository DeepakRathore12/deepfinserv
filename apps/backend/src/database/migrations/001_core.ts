import type { Knex } from 'knex';

/** Reference data: products, lenders and their dated rate cards. */
export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await knex.schema.createTable('products', (t) => {
    t.string('slug', 40).primary();
    t.string('name', 80).notNullable();
    t.enu('kind', ['loan', 'card'], { useNative: true, enumName: 'product_kind' }).notNullable();
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('lenders', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 120).notNullable().unique();
    t.enu('lender_type', ['public_bank', 'private_bank', 'nbfc', 'hfc'], {
      useNative: true,
      enumName: 'lender_type',
    }).notNullable();
    t.string('regulator', 40).notNullable().defaultTo('RBI');
    t.string('website', 200);
    t.string('grievance_contact', 300);
    /** True for placeholder rows loaded by the development seed. Never shown in production. */
    t.boolean('is_sample').notNullable().defaultTo(false);
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('rate_cards', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('lender_id').notNullable().references('lenders.id').onDelete('RESTRICT');
    t.string('product_slug', 40).notNullable().references('products.slug');
    t.decimal('apr_min', 5, 2).notNullable();
    t.decimal('apr_max', 5, 2).notNullable();
    t.decimal('processing_fee_pct', 4, 2).notNullable().defaultTo(0);
    t.bigInteger('min_income').notNullable();
    t.bigInteger('max_amount').notNullable();
    t.integer('min_tenure').notNullable();
    t.integer('max_tenure').notNullable();
    t.decimal('foir_cap', 3, 2);
    t.string('kfs_url', 300);
    t.date('effective_from').notNullable().defaultTo(knex.fn.now());
    t.date('effective_to');
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamps(true, true);
    t.index(['product_slug', 'active']);
  });
  await knex.raw(
    'ALTER TABLE rate_cards ADD CONSTRAINT rate_cards_apr_chk CHECK (apr_min >= 0 AND apr_max >= apr_min)',
  );
  await knex.raw(
    'ALTER TABLE rate_cards ADD CONSTRAINT rate_cards_tenure_chk CHECK (min_tenure >= 0 AND max_tenure >= min_tenure)',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rate_cards');
  await knex.schema.dropTableIfExists('lenders');
  await knex.schema.dropTableIfExists('products');
  await knex.raw('DROP TYPE IF EXISTS lender_type; DROP TYPE IF EXISTS product_kind');
}
