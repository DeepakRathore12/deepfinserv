import type { Knex } from 'knex';

/** Lender logos for the home page partner strip, and which lenders appear there in what order. */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('lenders', (t) => {
    t.binary('logo');
    t.string('logo_mime', 20);
    t.timestamp('logo_updated_at', { useTz: true });
    t.boolean('show_on_home').notNullable().defaultTo(true);
    t.integer('display_order').notNullable().defaultTo(100);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('lenders', (t) => {
    t.dropColumns('logo', 'logo_mime', 'logo_updated_at', 'show_on_home', 'display_order');
  });
}
