import type { Knex } from 'knex';

export const QUEUE_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;

/** Credit score requests, callbacks, partner sign-ups, grievances, staff sessions and the audit log. */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`CREATE TYPE queue_status AS ENUM (${QUEUE_STATUSES.map((s) => `'${s}'`).join(',')})`);
  const status = (t: Knex.CreateTableBuilder) =>
    t.specificType('status', 'queue_status').notNullable().defaultTo('open');

  await knex.schema.createTable('credit_score_requests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('reference_no', 20).notNullable().unique();
    t.uuid('customer_id').notNullable().references('customers.id').onDelete('CASCADE');
    t.text('full_name_enc').notNullable();
    t.text('pan_enc').notNullable();
    t.string('pan_hash', 64).notNullable();
    t.string('provider', 20).notNullable();
    status(t);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('callbacks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 80).notNullable();
    t.string('mobile_hash', 64).notNullable();
    t.text('mobile_enc').notNullable();
    t.string('product_slug', 40).references('products.slug');
    t.string('city', 60).notNullable();
    t.enu('slot', ['morning', 'afternoon', 'evening'], {
      useNative: true,
      enumName: 'callback_slot',
    }).notNullable();
    status(t);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('partner_applications', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name', 80).notNullable();
    t.string('mobile_hash', 64).notNullable();
    t.text('mobile_enc').notNullable();
    t.text('email_enc').notNullable();
    t.string('city', 60).notNullable();
    t.string('profession', 60).notNullable();
    t.string('experience', 30).notNullable();
    status(t);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('grievances', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('ticket_no', 20).notNullable().unique();
    t.string('name', 80).notNullable();
    t.string('mobile_hash', 64).notNullable();
    t.text('mobile_enc').notNullable();
    t.string('reference_no', 20);
    t.string('category', 60).notNullable();
    t.text('message').notNullable();
    status(t);
    /** RBI expects a response within 30 days. */
    t.timestamp('due_at', { useTz: true }).notNullable();
    t.text('resolution');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('staff_sessions', (t) => {
    t.string('id_hash', 64).primary();
    t.uuid('staff_id').notNullable().references('staff_users.id').onDelete('CASCADE');
    t.timestamp('expires_at', { useTz: true }).notNullable();
    t.string('ip_hash', 64);
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('audit_log', (t) => {
    t.bigIncrements('id');
    t.uuid('staff_id').references('staff_users.id').onDelete('SET NULL');
    t.string('action', 60).notNullable();
    t.string('entity', 40).notNullable();
    t.string('entity_id', 64);
    t.jsonb('meta');
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['entity', 'entity_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  for (const tbl of [
    'audit_log',
    'staff_sessions',
    'grievances',
    'partner_applications',
    'callbacks',
    'credit_score_requests',
  ])
    await knex.schema.dropTableIfExists(tbl);
  await knex.raw('DROP TYPE IF EXISTS queue_status; DROP TYPE IF EXISTS callback_slot');
}
