import type { Knex } from 'knex';

/** Verified people, OTP challenges and the consent log. Mobile and PAN are stored encrypted with an HMAC for lookup. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('otp_challenges', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('mobile_hash', 64).notNullable();
    t.text('mobile_enc').notNullable();
    t.enu('purpose', ['apply', 'score', 'callback'], {
      useNative: true,
      enumName: 'otp_purpose',
    }).notNullable();
    t.string('code_hash', 64).notNullable();
    t.smallint('attempts').notNullable().defaultTo(0);
    t.timestamp('expires_at', { useTz: true }).notNullable();
    t.timestamp('verified_at', { useTz: true });
    t.timestamp('consumed_at', { useTz: true });
    t.string('ip_hash', 64);
    t.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.index(['mobile_hash', 'created_at']);
  });

  await knex.schema.createTable('customers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('mobile_hash', 64).notNullable().unique();
    t.text('mobile_enc').notNullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('consents', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('customer_id').references('customers.id').onDelete('CASCADE');
    t.string('mobile_hash', 64).notNullable();
    t.enu('purpose', ['contact', 'bureau', 'marketing'], {
      useNative: true,
      enumName: 'consent_purpose',
    }).notNullable();
    /** Version of the consent wording shown, so we can prove what the person agreed to. */
    t.string('text_version', 20).notNullable();
    t.string('source', 40).notNullable();
    t.string('ip_hash', 64);
    t.string('user_agent', 300);
    t.timestamp('granted_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp('withdrawn_at', { useTz: true });
    t.index(['mobile_hash']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('consents');
  await knex.schema.dropTableIfExists('customers');
  await knex.schema.dropTableIfExists('otp_challenges');
  await knex.raw('DROP TYPE IF EXISTS consent_purpose; DROP TYPE IF EXISTS otp_purpose');
}
