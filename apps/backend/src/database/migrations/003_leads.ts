import type { Knex } from 'knex';

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'documents_pending',
  'submitted_to_lender',
  'sanctioned',
  'disbursed',
  'rejected',
  'closed',
] as const;

/** Leads, the offers shown to them (frozen for audit) and applications. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('staff_users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('email', 200).notNullable().unique();
    t.string('name', 120).notNullable();
    t.text('password_hash').notNullable();
    t.enu('role', ['admin', 'agent'], { useNative: true, enumName: 'staff_role' })
      .notNullable()
      .defaultTo('agent');
    t.boolean('active').notNullable().defaultTo(true);
    t.smallint('failed_logins').notNullable().defaultTo(0);
    t.timestamp('locked_until', { useTz: true });
    t.timestamp('last_login_at', { useTz: true });
    t.timestamps(true, true);
  });

  await knex.schema.createTable('leads', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('customer_id').notNullable().references('customers.id').onDelete('CASCADE');
    t.string('product_slug', 40).notNullable().references('products.slug');
    t.bigInteger('amount').notNullable();
    t.integer('tenure_months').notNullable();
    t.enu('employment', ['salaried', 'self_employed'], {
      useNative: true,
      enumName: 'employment_type',
    }).notNullable();
    t.bigInteger('monthly_income').notNullable();
    t.enu('status', [...LEAD_STATUSES], { useNative: true, enumName: 'lead_status' })
      .notNullable()
      .defaultTo('new');
    t.uuid('assigned_to').references('staff_users.id').onDelete('SET NULL');
    t.jsonb('utm');
    t.timestamps(true, true);
    t.index(['status', 'created_at']);
    t.index(['product_slug', 'created_at']);
  });

  await knex.schema.createTable('offer_snapshots', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('lead_id').notNullable().references('leads.id').onDelete('CASCADE');
    t.uuid('rate_card_id').notNullable().references('rate_cards.id');
    t.uuid('lender_id').notNullable().references('lenders.id');
    t.decimal('apr', 5, 2).notNullable();
    t.bigInteger('amount').notNullable();
    t.integer('emi').notNullable();
    t.integer('processing_fee').notNullable();
    t.decimal('processing_fee_pct', 4, 2).notNullable();
    t.integer('tenure_months').notNullable();
    t.boolean('full_amount').notNullable();
    t.boolean('best_match').notNullable();
    t.string('match_reason', 120).notNullable();
    t.string('rule_version', 10).notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.unique(['lead_id', 'rate_card_id']);
  });

  await knex.schema.createTable('applications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('reference_no', 20).notNullable().unique();
    t.uuid('lead_id').notNullable().unique().references('leads.id').onDelete('CASCADE');
    t.uuid('offer_id').notNullable().references('offer_snapshots.id');
    t.text('full_name_enc').notNullable();
    t.text('dob_enc').notNullable();
    t.text('pan_enc').notNullable();
    t.string('pan_hash', 64).notNullable();
    t.text('email_enc').notNullable();
    t.string('employer', 120).notNullable();
    t.string('pincode', 6).notNullable();
    t.string('city', 60).notNullable();
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['pan_hash']);
  });

  await knex.schema.createTable('lead_notes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('lead_id').notNullable().references('leads.id').onDelete('CASCADE');
    t.uuid('staff_id').references('staff_users.id').onDelete('SET NULL');
    t.string('status_from', 30);
    t.string('status_to', 30);
    t.text('body');
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['lead_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  for (const tbl of ['lead_notes', 'applications', 'offer_snapshots', 'leads', 'staff_users'])
    await knex.schema.dropTableIfExists(tbl);
  await knex.raw(
    'DROP TYPE IF EXISTS lead_status; DROP TYPE IF EXISTS employment_type; DROP TYPE IF EXISTS staff_role',
  );
}
